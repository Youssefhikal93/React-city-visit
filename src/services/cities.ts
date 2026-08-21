import {
  get,
  onValue,
  push,
  ref,
  remove,
  serverTimestamp,
  update,
  type Unsubscribe,
} from "firebase/database";

import { db } from "./firebase";
import type { City, CityUpdate, NewCity, StoredCity } from "../types";

function citiesRef(pin: string) {
  return ref(db, `profiles/${pin}/cities`);
}

function cityRef(pin: string, id: string) {
  return ref(db, `profiles/${pin}/cities/${id}`);
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

function normalizeCity(id: string, city: StoredCity): City {
  return {
    id,
    cityName: city.cityName ?? "",
    country: city.country ?? "",
    emoji: city.emoji ?? "",
    date: city.date ?? null,
    notes: city.notes ?? "",
    image: city.image ?? null,
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
 * Live subscription to one profile's cities. Returns the unsubscribe function
 * so callers can detach on logout or unmount.
 */
export function subscribeToCities(
  pin: string,
  onCities: (cities: City[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onValue(
    citiesRef(pin),
    (snapshot) => onCities(toCityList(snapshot.val())),
    (error) => onError(error)
  );
}

export async function fetchCity(pin: string, id: string): Promise<City> {
  const snapshot = await get(cityRef(pin, id));
  if (!snapshot.exists())
    throw new Error("That city is no longer in your list.");
  return normalizeCity(id, snapshot.val() as StoredCity);
}

export async function createCity(pin: string, city: NewCity): Promise<City> {
  const payload = {
    cityName: city.cityName,
    country: city.country ?? "",
    emoji: city.emoji ?? "",
    date: serializeDate(city.date),
    notes: city.notes ?? "",
    position: {
      lat: Number(city.position.lat),
      lng: Number(city.position.lng),
    },
    createdAt: serverTimestamp(),
  };

  const created = await push(citiesRef(pin), payload);
  if (!created.key) throw new Error("Firebase did not return a key for the new city.");

  // Re-read so `createdAt` is the resolved server value, not the sentinel.
  return fetchCity(pin, created.key);
}

export async function updateCity(
  pin: string,
  id: string,
  updates: CityUpdate
): Promise<City> {
  await update(cityRef(pin, id), updates);
  return fetchCity(pin, id);
}

export async function deleteCity(pin: string, id: string): Promise<void> {
  await remove(cityRef(pin, id));
}
