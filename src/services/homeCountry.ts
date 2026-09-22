import { onValue, ref, remove, set, type Unsubscribe } from "firebase/database";

import { db } from "./firebase";

const COUNTRY_CODE_PATTERN = /^[a-z]{2}$/;

function homeCountryRef(username: string) {
  return ref(db, `users/${username}/settings/homeCountry`);
}

export function isCountryCode(countryCode: string): boolean {
  return COUNTRY_CODE_PATTERN.test(countryCode);
}

/** Subscribes to the Account's private home Country setting. */
export function subscribeToHomeCountry(
  username: string,
  onHomeCountry: (countryCode: string | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onValue(
    homeCountryRef(username),
    (snapshot) => {
      const countryCode = snapshot.val();
      onHomeCountry(
        typeof countryCode === "string" && isCountryCode(countryCode)
          ? countryCode
          : null,
      );
    },
    onError,
  );
}

export async function saveHomeCountry(
  username: string,
  countryCode: string,
): Promise<void> {
  if (!isCountryCode(countryCode)) throw new Error("Choose a valid Country.");
  await set(homeCountryRef(username), countryCode);
}

export async function clearHomeCountry(username: string): Promise<void> {
  await remove(homeCountryRef(username));
}
