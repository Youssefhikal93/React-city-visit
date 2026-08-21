import { get, ref, remove, serverTimestamp, set, update } from "firebase/database";

import { db } from "./firebase";

export const PIN_LENGTH = 4;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

const PIN_PATTERN = /^[0-9]{4}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

/** Narrows a PIN candidate to exactly four digits. */
export function isValidPin(pin: string | null | undefined): pin is string {
  return typeof pin === "string" && PIN_PATTERN.test(pin);
}

export function isValidUsername(username: string | null | undefined): boolean {
  return typeof username === "string" && USERNAME_PATTERN.test(username.trim());
}

/**
 * Database keys are case sensitive and reject `.`, `$`, `#`, `[`, `]` and `/`,
 * so the lowercased name is the key and the typed casing is kept for display.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/** A message explaining why a username is unusable, or null when it's fine. */
export function usernameError(username: string): string | null {
  const trimmed = username.trim();

  if (!trimmed) return "Enter a username.";
  if (trimmed.length < USERNAME_MIN_LENGTH)
    return `Usernames need at least ${USERNAME_MIN_LENGTH} characters.`;
  if (trimmed.length > USERNAME_MAX_LENGTH)
    return `Usernames can be at most ${USERNAME_MAX_LENGTH} characters.`;
  if (!USERNAME_PATTERN.test(trimmed))
    return "Use only letters, numbers, hyphens and underscores.";

  return null;
}

export interface UserProfile {
  displayName: string;
  createdAt: number;
  lastLoginAt: number;
}

function profileRef(username: string) {
  return ref(db, `users/${username}/profile`);
}

function sessionRef(uid: string) {
  return ref(db, `sessions/${uid}`);
}

/** The profile is readable by any signed-in visitor, so signup can check this. */
export async function fetchProfile(username: string): Promise<UserProfile | null> {
  const snapshot = await get(profileRef(username));
  return snapshot.exists() ? (snapshot.val() as UserProfile) : null;
}

export async function usernameExists(username: string): Promise<boolean> {
  return (await fetchProfile(username)) !== null;
}

/**
 * Claims a free username. The PIN write is only permitted while no PIN exists
 * for that username, so two people racing for the same name cannot both win.
 */
export async function createUser(
  username: string,
  displayName: string,
  pin: string
): Promise<void> {
  await set(ref(db, `users/${username}/pin`), pin);
  await set(profileRef(username), {
    displayName,
    createdAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

/**
 * Proves the PIN. The rules only allow this write when the submitted PIN
 * matches the stored one, so a wrong PIN comes back as PERMISSION_DENIED
 * instead of being checked in the browser. Everything else in the app is
 * gated on the session this creates.
 */
export async function openSession(
  uid: string,
  username: string,
  pin: string
): Promise<void> {
  await set(sessionRef(uid), { username, pin });
}

/** The username this anonymous account is currently signed in as. */
export async function readSession(uid: string): Promise<string | null> {
  const snapshot = await get(ref(db, `sessions/${uid}/username`));
  return snapshot.exists() ? (snapshot.val() as string) : null;
}

export async function closeSession(uid: string): Promise<void> {
  await remove(sessionRef(uid));
}

export async function touchLogin(username: string): Promise<void> {
  await update(profileRef(username), { lastLoginAt: serverTimestamp() });
}
