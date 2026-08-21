import { get, ref, serverTimestamp, update } from "firebase/database";
import { db } from "./firebase";

export const PIN_LENGTH = 4;

const PIN_PATTERN = /^[0-9]{4}$/;

/** Narrows an unknown PIN candidate to a usable 4-digit string. */
export function isValidPin(pin: string | null | undefined): pin is string {
  return typeof pin === "string" && PIN_PATTERN.test(pin);
}

function profileRef(pin: string) {
  return ref(db, `profiles/${pin}`);
}

/** True when a travel log already exists for this PIN. */
export async function profileExists(pin: string): Promise<boolean> {
  const snapshot = await get(ref(db, `profiles/${pin}/createdAt`));
  return snapshot.exists();
}

/** Creates the profile node for a brand new PIN. */
export async function createProfile(pin: string): Promise<void> {
  await update(profileRef(pin), {
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

/** Records that this PIN was just used to sign in. */
export async function touchProfile(pin: string): Promise<void> {
  await update(profileRef(pin), { lastLoginAt: serverTimestamp() });
}
