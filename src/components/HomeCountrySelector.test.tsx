import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "../context/AuthContext";
import { HomeCountryProvider } from "../context/HomeCountryContext";
import HomeCountrySelector from "./HomeCountrySelector";

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

interface Subscription {
  path: string;
  onError: (error: Error) => void;
  onValue: (snapshot: { val: () => string | null }) => void;
  active: boolean;
}

const accountForUid = { "uid-alice": "alice", "uid-bruno": "bruno" };
const homeCountryValues = new Map<string, string>();
let authStateListener:
  | ((user: { uid: string } | null) => void | Promise<void>)
  | null = null;
let subscriptions: Subscription[] = [];

function homeCountryPath(username: string): string {
  return `users/${username}/settings/homeCountry`;
}

function snapshot(countryCode: string | undefined) {
  return { val: () => countryCode ?? null };
}

function latestSubscription(username: string): Subscription {
  const subscription = [...subscriptions]
    .reverse()
    .find((candidate) => candidate.path === homeCountryPath(username));
  if (!subscription) throw new Error(`No subscription for ${username}.`);
  return subscription;
}

function emitHomeCountry(subscription: Subscription): void {
  subscription.onValue(snapshot(homeCountryValues.get(subscription.path)));
}

function notifyActiveSubscriptions(path: string): void {
  subscriptions
    .filter((subscription) => subscription.active && subscription.path === path)
    .forEach(emitHomeCountry);
}

async function signInAs(uid: keyof typeof accountForUid): Promise<void> {
  await act(async () => {
    await authStateListener?.({ uid });
  });
}

async function renderHomeCountrySelector() {
  const user = userEvent.setup();
  const rendered = render(
    <AuthProvider>
      <HomeCountryProvider>
        <HomeCountrySelector />
      </HomeCountryProvider>
    </AuthProvider>,
  );
  await waitFor(() => expect(authStateListener).not.toBeNull());
  return { user, ...rendered };
}

async function loadHomeCountry(username: string): Promise<void> {
  await act(async () => emitHomeCountry(latestSubscription(username)));
}

beforeEach(() => {
  vi.clearAllMocks();
  authStateListener = null;
  subscriptions = [];
  homeCountryValues.clear();

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
      homeCountryValues.set(path, countryCode);
      notifyActiveSubscriptions(path);
    },
  );
  firebase.database.remove.mockImplementation(async ({ path }: { path: string }) => {
    homeCountryValues.delete(path);
    notifyActiveSubscriptions(path);
  });
});

describe("HomeCountryProvider and selector", () => {
  it("saves, reloads, replaces, and clears the private Country selection", async () => {
    const firstPage = await renderHomeCountrySelector();
    await signInAs("uid-alice");
    await waitFor(() => expect(latestSubscription("alice")).toBeDefined());
    await loadHomeCountry("alice");

    const countrySelector = screen.getByRole("combobox", {
      name: "Home Country",
    });
    await firstPage.user.selectOptions(countrySelector, "se");
    await waitFor(() => expect(countrySelector).toHaveValue("se"));

    firstPage.unmount();
    const reloadedPage = await renderHomeCountrySelector();
    await signInAs("uid-alice");
    await waitFor(() => expect(subscriptions).toHaveLength(2));
    await loadHomeCountry("alice");
    const reloadedSelector = screen.getByRole("combobox", {
      name: "Home Country",
    });
    expect(reloadedSelector).toHaveValue("se");

    await reloadedPage.user.selectOptions(reloadedSelector, "fr");
    await waitFor(() => expect(reloadedSelector).toHaveValue("fr"));
    await reloadedPage.user.click(
      screen.getByRole("button", { name: /Clear home Country/ }),
    );
    await waitFor(() => expect(reloadedSelector).toHaveValue(""));
    expect(homeCountryValues.has(homeCountryPath("alice"))).toBe(false);
  });

  it("restores the saved Country and explains a failed save", async () => {
    const { user } = await renderHomeCountrySelector();
    homeCountryValues.set(homeCountryPath("alice"), "se");
    await signInAs("uid-alice");
    await loadHomeCountry("alice");
    firebase.database.set.mockRejectedValueOnce(new Error("Write denied."));

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Home Country" }),
      "fr",
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("Write denied.");
    expect(screen.getByRole("combobox", { name: "Home Country" })).toHaveValue(
      "se",
    );
  });

  it("hides an obsolete Country until the next Account's delayed load arrives", async () => {
    await renderHomeCountrySelector();
    homeCountryValues.set(homeCountryPath("alice"), "se");
    await signInAs("uid-alice");
    await waitFor(() => expect(latestSubscription("alice")).toBeDefined());
    await loadHomeCountry("alice");
    const aliceSubscription = latestSubscription("alice");
    expect(screen.getByRole("combobox", { name: "Home Country" })).toHaveValue(
      "se",
    );

    await signInAs("uid-bruno");
    const countrySelector = screen.getByRole("combobox", {
      name: "Home Country",
    });
    expect(countrySelector).toHaveValue("");
    expect(countrySelector).toBeDisabled();

    await act(async () => emitHomeCountry(aliceSubscription));
    expect(countrySelector).toHaveValue("");

    homeCountryValues.set(homeCountryPath("bruno"), "no");
    await loadHomeCountry("bruno");
    expect(countrySelector).toHaveValue("no");
  });

  it("shows a failed load and starts a new subscription when retried", async () => {
    const { user } = await renderHomeCountrySelector();
    await signInAs("uid-alice");
    await waitFor(() => expect(latestSubscription("alice")).toBeDefined());
    const failedSubscription = latestSubscription("alice");

    await act(async () => failedSubscription.onError(new Error("Read denied.")));

    expect(await screen.findByRole("alert")).toHaveTextContent("Read denied.");
    await user.click(
      screen.getByRole("button", { name: "Try loading home Country again" }),
    );
    await waitFor(() => expect(subscriptions).toHaveLength(2));
    homeCountryValues.set(homeCountryPath("alice"), "fr");
    await loadHomeCountry("alice");

    expect(screen.queryByText("Read denied.")).not.toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Home Country" })).toHaveValue(
      "fr",
    );
  });
});
