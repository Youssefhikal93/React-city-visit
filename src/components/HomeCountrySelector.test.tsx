import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../context/AuthContext";
import { HomeCountryProvider } from "../context/HomeCountryContext";
import HomeCountrySelector from "./HomeCountrySelector";
import PlannedCountrySelector from "./PlannedCountrySelector";

vi.hoisted(() => {
  process.env.VITE_FIREBASE_API_KEY = "test-api-key";
  process.env.VITE_FIREBASE_AUTH_DOMAIN = "test.firebaseapp.com";
  process.env.VITE_FIREBASE_DATABASE_URL = "https://test.firebaseio.com";
  process.env.VITE_FIREBASE_PROJECT_ID = "test";
  process.env.VITE_FIREBASE_STORAGE_BUCKET = "test.appspot.com";
  process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = "123";
  process.env.VITE_FIREBASE_APP_ID = "1:123:web:test";
});

const firebase = vi.hoisted(() => ({
  auth: { currentUser: null },
  onAuthStateChanged: vi.fn(),
  database: {
    get: vi.fn(),
    onValue: vi.fn(),
    ref: vi.fn(),
    remove: vi.fn(),
    set: vi.fn(),
    serverTimestamp: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => firebase.auth),
  onAuthStateChanged: firebase.onAuthStateChanged,
  signInAnonymously: vi.fn(),
  signOut: vi.fn(),
}));
vi.mock("firebase/database", () => ({
  ...firebase.database,
  getDatabase: vi.fn(() => ({})),
}));

interface Preferences {
  homeCountry?: string;
  plannedCountry?: string;
}

type Preference = keyof Preferences;

interface PreferenceCase {
  preference: Preference;
  label: string;
  firstCountry: string;
  replacementCountry: string;
}

interface Subscription {
  path: string;
  onError: (error: Error) => void;
  onValue: (snapshot: { val: () => Preferences | null }) => void;
  active: boolean;
}

const preferenceCases: PreferenceCase[] = [
  {
    preference: "homeCountry",
    label: "Home Country",
    firstCountry: "se",
    replacementCountry: "fr",
  },
  {
    preference: "plannedCountry",
    label: "Planned destination",
    firstCountry: "is",
    replacementCountry: "fr",
  },
];
const accountForUid = { "uid-alice": "alice", "uid-bruno": "bruno" };
const preferencesByAccount = new Map<string, Preferences>();
let authStateListener:
  | ((user: { uid: string } | null) => void | Promise<void>)
  | null = null;
let subscriptions: Subscription[] = [];

function settingsPath(username: string): string {
  return `users/${username}/settings`;
}

function usernameFromSettingsPath(path: string): string {
  const match = /^users\/([^/]+)\/settings$/.exec(path);
  if (!match) throw new Error(`Expected settings path, received ${path}.`);
  return match[1];
}

function latestSubscription(username: string): Subscription {
  const subscription = [...subscriptions]
    .reverse()
    .find((candidate) => candidate.path === settingsPath(username));
  if (!subscription) throw new Error(`No subscription for ${username}.`);
  return subscription;
}

function selector(label: string): HTMLSelectElement {
  return screen.getByRole("combobox", { name: label });
}

function emitPreferences(subscription: Subscription): void {
  const username = usernameFromSettingsPath(subscription.path);
  subscription.onValue({
    val: () => preferencesByAccount.get(username) ?? null,
  });
}

function notifyActiveSubscriptions(username: string): void {
  subscriptions
    .filter(
      (subscription) =>
        subscription.active && subscription.path === settingsPath(username),
    )
    .forEach(emitPreferences);
}

async function signInAs(uid: keyof typeof accountForUid): Promise<void> {
  await act(async () => {
    await authStateListener?.({ uid });
  });
}

async function renderCountrySelectors() {
  const user = userEvent.setup();
  const rendered = render(
    <AuthProvider>
      <HomeCountryProvider>
        <PlannedCountrySelector />
        <HomeCountrySelector />
      </HomeCountryProvider>
    </AuthProvider>,
  );
  await waitFor(() => expect(authStateListener).not.toBeNull());
  return { user, ...rendered };
}

async function loadPreferences(username: string): Promise<void> {
  await act(async () => emitPreferences(latestSubscription(username)));
}

beforeEach(() => {
  vi.clearAllMocks();
  authStateListener = null;
  subscriptions = [];
  preferencesByAccount.clear();

  firebase.onAuthStateChanged.mockImplementation((_auth, listener) => {
    authStateListener = listener;
    return () => {
      authStateListener = null;
    };
  });
  firebase.database.ref.mockImplementation((_database, path: string) => ({ path }));
  firebase.database.get.mockImplementation(async ({ path }: { path: string }) => {
    const sessionMatch = /^sessions\/(.+)\/username$/.exec(path);
    if (sessionMatch)
      return {
        exists: () => true,
        val: () => accountForUid[sessionMatch[1] as keyof typeof accountForUid],
      };
    if (/^users\/[^/]+\/profile$/.test(path))
      return { exists: () => true, val: () => ({ displayName: "Test Account" }) };
    return { exists: () => false, val: () => null };
  });
  firebase.database.onValue.mockImplementation(
    (
      { path }: { path: string },
      onValue: Subscription["onValue"],
      onError: Subscription["onError"],
    ) => {
      const subscription: Subscription = { path, onValue, onError, active: true };
      subscriptions.push(subscription);
      return () => {
        subscription.active = false;
      };
    },
  );
  firebase.database.set.mockImplementation(
    async ({ path }: { path: string }, countryCode: string) => {
      const match = /^users\/([^/]+)\/settings\/(homeCountry|plannedCountry)$/.exec(path);
      if (!match) throw new Error(`Expected Country preference path, received ${path}.`);
      const [, username, preference] = match;
      preferencesByAccount.set(username, {
        ...preferencesByAccount.get(username),
        [preference as Preference]: countryCode,
      });
      notifyActiveSubscriptions(username);
    },
  );
  firebase.database.remove.mockImplementation(async ({ path }: { path: string }) => {
    const match = /^users\/([^/]+)\/settings\/(homeCountry|plannedCountry)$/.exec(path);
    if (!match) throw new Error(`Expected Country preference path, received ${path}.`);
    const [, username, preference] = match;
    const preferences = { ...preferencesByAccount.get(username) };
    delete preferences[preference as Preference];
    preferencesByAccount.set(username, preferences);
    notifyActiveSubscriptions(username);
  });
});

describe("Account Country preference selectors", () => {
  it.each(preferenceCases)(
    "saves, reloads, replaces, and clears $label",
    async ({ preference, label, firstCountry, replacementCountry }) => {
      const firstPage = await renderCountrySelectors();
      await signInAs("uid-alice");
      await waitFor(() => expect(latestSubscription("alice")).toBeDefined());
      await loadPreferences("alice");

      await firstPage.user.selectOptions(selector(label), firstCountry);
      await waitFor(() => expect(selector(label)).toHaveValue(firstCountry));

      firstPage.unmount();
      const reloadedPage = await renderCountrySelectors();
      await signInAs("uid-alice");
      await waitFor(() => expect(subscriptions).toHaveLength(2));
      await loadPreferences("alice");
      expect(selector(label)).toHaveValue(firstCountry);

      await reloadedPage.user.selectOptions(selector(label), replacementCountry);
      await waitFor(() => expect(selector(label)).toHaveValue(replacementCountry));
      await reloadedPage.user.click(
        screen.getByRole("button", { name: new RegExp(`Clear ${label}`, "i") }),
      );
      await waitFor(() => expect(selector(label)).toHaveValue(""));
      expect(preferencesByAccount.get("alice")?.[preference]).toBeUndefined();
    },
  );

  it.each(preferenceCases)(
    "restores $label and explains a failed save",
    async ({ preference, label, firstCountry, replacementCountry }) => {
      const { user } = await renderCountrySelectors();
      preferencesByAccount.set("alice", { [preference]: firstCountry });
      await signInAs("uid-alice");
      await loadPreferences("alice");
      firebase.database.set.mockRejectedValueOnce(new Error("Write denied."));

      await user.selectOptions(selector(label), replacementCountry);

      expect(await screen.findByRole("alert")).toHaveTextContent("Write denied.");
      expect(selector(label)).toHaveValue(firstCountry);
    },
  );

  it("does not expose either preference while a different Account loads", async () => {
    await renderCountrySelectors();
    preferencesByAccount.set("alice", {
      homeCountry: "se",
      plannedCountry: "fr",
    });
    await signInAs("uid-alice");
    await loadPreferences("alice");
    const aliceSubscription = latestSubscription("alice");
    expect(selector("Home Country")).toHaveValue("se");
    expect(selector("Planned destination")).toHaveValue("fr");

    await signInAs("uid-bruno");
    expect(selector("Home Country")).toHaveValue("");
    expect(selector("Planned destination")).toHaveValue("");
    expect(selector("Planned destination")).toBeDisabled();

    await act(async () => emitPreferences(aliceSubscription));
    expect(selector("Home Country")).toHaveValue("");
    expect(selector("Planned destination")).toHaveValue("");

    preferencesByAccount.set("bruno", { homeCountry: "no", plannedCountry: "is" });
    await loadPreferences("bruno");
    expect(selector("Home Country")).toHaveValue("no");
    expect(selector("Planned destination")).toHaveValue("is");
  });

  it("shows a failed preference load and retries the subscription", async () => {
    const { user } = await renderCountrySelectors();
    await signInAs("uid-alice");
    await waitFor(() => expect(latestSubscription("alice")).toBeDefined());
    const failedSubscription = latestSubscription("alice");

    await act(async () => failedSubscription.onError(new Error("Read denied.")));

    const loadErrorAlerts = await screen.findAllByRole("alert");
    expect(loadErrorAlerts).toHaveLength(2);
    loadErrorAlerts.forEach((alert) =>
      expect(alert).toHaveTextContent("Read denied."),
    );
    await user.click(
      screen.getAllByRole("button", {
        name: "Try loading Country preferences again",
      })[0],
    );
    await waitFor(() => expect(subscriptions).toHaveLength(2));
    preferencesByAccount.set("alice", { homeCountry: "fr", plannedCountry: "no" });
    await loadPreferences("alice");

    expect(screen.queryByText("Read denied.")).not.toBeInTheDocument();
    expect(selector("Home Country")).toHaveValue("fr");
    expect(selector("Planned destination")).toHaveValue("no");
  });
});
