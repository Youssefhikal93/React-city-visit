import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  database: {
    onValue: vi.fn(),
    ref: vi.fn(),
    remove: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(() => ({})) }));
vi.mock("firebase/database", () => ({
  ...firebase.database,
  getDatabase: vi.fn(() => ({})),
}));

import {
  clearCountryPreference,
  saveCountryPreference,
  subscribeToCountryPreferences,
} from "./homeCountry";

describe("Account Country preference persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.database.ref.mockImplementation((_database, path: string) => ({ path }));
  });

  it("loads known settings and ignores unknown or malformed legacy values", () => {
    const onPreferences = vi.fn();
    firebase.database.onValue.mockImplementation((_reference, listener) => {
      listener({
        val: () => ({ homeCountry: "se", plannedCountry: "France", future: "us" }),
      });
      return () => undefined;
    });

    subscribeToCountryPreferences("tester", onPreferences, vi.fn());

    expect(onPreferences).toHaveBeenCalledWith({
      homeCountryCode: "se",
      plannedCountryCode: null,
    });
  });

  it("writes and clears only the selected Account preference", async () => {
    await saveCountryPreference("tester", "plannedCountry", "fr");
    await saveCountryPreference("traveler", "homeCountry", "no");
    await clearCountryPreference("tester", "plannedCountry");

    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/tester/settings/plannedCountry" },
      "fr",
    );
    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/traveler/settings/homeCountry" },
      "no",
    );
    expect(firebase.database.remove).toHaveBeenCalledWith({
      path: "users/tester/settings/plannedCountry",
    });
  });
});
