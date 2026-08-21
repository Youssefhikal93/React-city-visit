import { get, ref, serverTimestamp, update } from "firebase/database";
import { db } from "./firebase";

export const PIN_LENGTH = 4;

const PIN_PATTERN = /^[0-9]{4}$/;

export function isValidPin(pin) {
  return PIN_PATTERN.test(String(pin ?? ""));
}

function profileRef(pin) {
  return ref(db, `profiles/${pin}`);
}

/** True when a travel log already exists for this PIN. */
export async function profileExists(pin) {
  const snapshot = await get(ref(db, `profiles/${pin}/createdAt`));
  return snapshot.exists();
}

/** Creates the profile node for a brand new PIN. */
export async function createProfile(pin) {
  await update(profileRef(pin), {
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

/** Records that this PIN was just used to sign in. */
export async function touchProfile(pin) {
  await update(profileRef(pin), { lastLoginAt: serverTimestamp() });
}
