import {
  onValue,
  ref,
  remove,
  set,
  update,
  type Unsubscribe,
} from "firebase/database";

import { db } from "./firebase";

const COUNTRY_CODE_PATTERN = /^[a-z]{2}$/;

export type CountryList = "livedIn" | "planned";

export interface AccountCountryLists {
  livedInCountryCodes: string[];
  plannedCountryCodes: string[];
}

const listKey: Record<CountryList, string> = {
  livedIn: "livedInCountries",
  planned: "plannedCountries",
};

/** Accounts saved one home and one planned Country before the lists existed. */
const legacyKey: Record<CountryList, string> = {
  livedIn: "homeCountry",
  planned: "plannedCountry",
};

function settingsRef(username: string) {
  return ref(db, `users/${username}/settings`);
}

function countryRef(username: string, list: CountryList, countryCode: string) {
  return ref(db, `users/${username}/settings/${listKey[list]}/${countryCode}`);
}

function isCountryCode(countryCode: unknown): countryCode is string {
  return typeof countryCode === "string" && COUNTRY_CODE_PATTERN.test(countryCode);
}

function countryCodesFromSettings(
  settings: Record<string, unknown>,
  list: CountryList,
): string[] {
  const stored = settings[listKey[list]];
  const codes =
    typeof stored === "object" && stored !== null
      ? Object.entries(stored)
          .filter(([countryCode, isListed]) => isListed === true && isCountryCode(countryCode))
          .map(([countryCode]) => countryCode)
      : [];
  const legacyCode = settings[legacyKey[list]];
  if (isCountryCode(legacyCode) && !codes.includes(legacyCode)) codes.push(legacyCode);
  return codes.sort();
}

function legacyMigration(settings: Record<string, unknown>): Record<string, unknown> | null {
  const updates: Record<string, unknown> = {};
  (Object.keys(listKey) as CountryList[]).forEach((list) => {
    const legacyCode = settings[legacyKey[list]];
    if (legacyCode === undefined) return;
    if (isCountryCode(legacyCode)) updates[`${listKey[list]}/${legacyCode}`] = true;
    updates[legacyKey[list]] = null;
  });
  return Object.keys(updates).length ? updates : null;
}

/**
 * Subscribes to the Account's lived-in and planned Country lists. A legacy
 * single home or planned Country is reported as part of its list straight
 * away and moved into that list in the database.
 */
export function subscribeToCountryLists(
  username: string,
  onLists: (lists: AccountCountryLists) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onValue(
    settingsRef(username),
    (snapshot) => {
      const stored: unknown = snapshot.val();
      const settings =
        typeof stored === "object" && stored !== null
          ? (stored as Record<string, unknown>)
          : {};
      onLists({
        livedInCountryCodes: countryCodesFromSettings(settings, "livedIn"),
        plannedCountryCodes: countryCodesFromSettings(settings, "planned"),
      });
      const migration = legacyMigration(settings);
      if (migration)
        update(settingsRef(username), migration).catch((error: unknown) =>
          console.error("Couldn't move legacy Country preferences:", error),
        );
    },
    onError,
  );
}

export async function addCountryToList(
  username: string,
  list: CountryList,
  countryCode: string,
): Promise<void> {
  if (!isCountryCode(countryCode)) throw new Error("Choose a valid Country.");
  await set(countryRef(username, list, countryCode), true);
}

export async function removeCountryFromList(
  username: string,
  list: CountryList,
  countryCode: string,
): Promise<void> {
  if (!isCountryCode(countryCode)) return;
  await remove(countryRef(username, list, countryCode));
}
