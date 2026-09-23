import { onValue, ref, remove, set, type Unsubscribe } from "firebase/database";

import { db } from "./firebase";

const COUNTRY_CODE_PATTERN = /^[a-z]{2}$/;

export type CountryPreference = "homeCountry" | "plannedCountry";

export interface AccountCountryPreferences {
  homeCountryCode: string | null;
  plannedCountryCode: string | null;
}

function settingsRef(username: string) {
  return ref(db, `users/${username}/settings`);
}

function countryPreferenceRef(username: string, preference: CountryPreference) {
  return ref(db, `users/${username}/settings/${preference}`);
}

function isCountryCode(countryCode: string): boolean {
  return COUNTRY_CODE_PATTERN.test(countryCode);
}

function countryCodeFromSettings(
  settings: unknown,
  preference: CountryPreference,
): string | null {
  if (typeof settings !== "object" || settings === null) return null;
  const countryCode = (settings as Record<string, unknown>)[preference];
  return typeof countryCode === "string" && isCountryCode(countryCode)
    ? countryCode
    : null;
}

/** Subscribes to the Account's private Country preferences. */
export function subscribeToCountryPreferences(
  username: string,
  onPreferences: (preferences: AccountCountryPreferences) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onValue(
    settingsRef(username),
    (snapshot) => {
      const settings = snapshot.val();
      onPreferences({
        homeCountryCode: countryCodeFromSettings(settings, "homeCountry"),
        plannedCountryCode: countryCodeFromSettings(settings, "plannedCountry"),
      });
    },
    onError,
  );
}

export async function saveCountryPreference(
  username: string,
  preference: CountryPreference,
  countryCode: string,
): Promise<void> {
  if (!isCountryCode(countryCode)) throw new Error("Choose a valid Country.");
  await set(countryPreferenceRef(username, preference), countryCode);
}

export async function clearCountryPreference(
  username: string,
  preference: CountryPreference,
): Promise<void> {
  await remove(countryPreferenceRef(username, preference));
}
