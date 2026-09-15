import {
  get,
  onValue,
  push,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  update,
  type Unsubscribe,
} from "firebase/database";

import { db } from "./firebase";
import { findSavedCity } from "./cityIdentity";
import type { City, CityUpdate, NewCity, StoredCity } from "../types";

const LEGACY_MEMORY_ID = "legacy-image";

function citiesRef(username: string) {
  return ref(db, `users/${username}/cities`);
}

function cityRef(username: string, id: string) {
  return ref(db, `users/${username}/cities/${id}`);
}

function memoriesRef(username: string, cityId: string) {
  return ref(db, `users/${username}/cities/${cityId}/memories`);
}

function memoryRef(username: string, cityId: string, memoryId: string) {
  return ref(db, `users/${username}/cities/${cityId}/memories/${memoryId}`);
}

function compareMemoryIds(firstId: string, secondId: string): number {
  if (firstId === LEGACY_MEMORY_ID) return -1;
  if (secondId === LEGACY_MEMORY_ID) return 1;
  return firstId.localeCompare(secondId);
}

async function readStoredCity(
  username: string,
  id: string,
): Promise<StoredCity> {
  const snapshot = await get(cityRef(username, id));
  if (!snapshot.exists())
    throw new Error("That city is no longer in your list.");
  return snapshot.val() as StoredCity;
}

/**
 * The Realtime Database stores children as a keyed object; the UI wants an
 * array where each item carries its own key as `id`.
 */
function toCityList(value: Record<string, StoredCity> | null): City[] {
  if (!value) return [];
  return Object.entries(value)
    .map(([id, city]) => normalizeCity(id, city))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function normalizeCity(id: string, city: StoredCity): City {
  const memories =
    city.memories === undefined
      ? city.image
        ? [{ id: LEGACY_MEMORY_ID, dataUri: city.image }]
        : []
      : Object.entries(city.memories)
          .sort(([firstId], [secondId]) => compareMemoryIds(firstId, secondId))
          .map(([memoryId, dataUri]) => ({ id: memoryId, dataUri }));

  return {
    id,
    cityName: city.cityName ?? "",
    country: city.country ?? "",
    emoji: city.emoji ?? "",
    date: city.date ?? null,
    notes: city.notes ?? "",
    visitCount:
      Number.isSafeInteger(city.visitCount) && city.visitCount! > 0
        ? city.visitCount
        : 1,
    memories,
    createdAt: city.createdAt ?? 0,
    position: {
      lat: Number(city.position?.lat ?? 0),
      lng: Number(city.position?.lng ?? 0),
    },
  };
}

/** Dates arrive from the date picker as a Date; store them as ISO strings. */
function serializeDate(date: Date | string | null | undefined): string {
  if (!date) return new Date().toISOString();
  return date instanceof Date
    ? date.toISOString()
    : new Date(date).toISOString();
}

/**
 * Live subscription to one account's cities. Returns the unsubscribe function
 * so callers can detach on logout or unmount.
 */
export function subscribeToCities(
  username: string,
  onCities: (cities: City[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onValue(
    citiesRef(username),
    (snapshot) => onCities(toCityList(snapshot.val())),
    (error) => onError(error),
  );
}

export async function fetchCity(username: string, id: string): Promise<City> {
  return normalizeCity(id, await readStoredCity(username, id));
}

export async function createCity(
  username: string,
  city: NewCity,
): Promise<City> {
  const payload = {
    cityName: city.cityName,
    country: city.country ?? "",
    emoji: city.emoji ?? "",
    date: serializeDate(city.date),
    notes: city.notes ?? "",
    visitCount: 1,
    position: {
      lat: Number(city.position.lat),
      lng: Number(city.position.lng),
    },
    createdAt: serverTimestamp(),
  };

  const created = push(citiesRef(username));
  if (!created.key)
    throw new Error("Firebase did not return a key for the new city.");
  const id = created.key;
  const result = await runTransaction(
    citiesRef(username),
    (stored: Record<string, StoredCity> | null) => {
      if (findSavedCity(toCityList(stored), city)) return;
      return { ...stored, [id]: payload };
    },
    { applyLocally: false },
  );
  if (!result.committed)
    throw new Error(
      "This city is already in your list. Open it to update your visits.",
    );

  // Re-read so `createdAt` is the resolved server value, not the sentinel.
  return fetchCity(username, created.key);
}

export async function updateCity(
  username: string,
  id: string,
  updates: CityUpdate,
): Promise<City> {
  if (
    updates.visitCount !== undefined &&
    (!Number.isSafeInteger(updates.visitCount) || updates.visitCount < 1)
  ) {
    throw new Error("Visit count must be a whole number of at least 1.");
  }
  await update(cityRef(username, id), updates);
  return fetchCity(username, id);
}

export async function deleteCity(username: string, id: string): Promise<void> {
  await remove(cityRef(username, id));
}

export async function addMemory(
  username: string,
  cityId: string,
  dataUri: string,
): Promise<void> {
  const storedCity = await readStoredCity(username, cityId);
  if (!storedCity.image) {
    await push(memoriesRef(username, cityId), dataUri);
    return;
  }

  const newMemory = push(memoriesRef(username, cityId));
  if (!newMemory.key)
    throw new Error("Firebase did not return a key for the new Memory.");

  await update(cityRef(username, cityId), {
    memories: {
      ...storedCity.memories,
      [LEGACY_MEMORY_ID]: storedCity.image,
      [newMemory.key]: dataUri,
    },
    image: null,
  });
}

export async function deleteMemory(
  username: string,
  cityId: string,
  memoryId: string,
): Promise<void> {
  if (memoryId !== LEGACY_MEMORY_ID) {
    await remove(memoryRef(username, cityId, memoryId));
    return;
  }

  const storedCity = await readStoredCity(username, cityId);
  if (!storedCity.image) {
    await remove(memoryRef(username, cityId, memoryId));
    return;
  }

  await update(cityRef(username, cityId), {
    memories: storedCity.memories ?? {},
    image: null,
  });
}
