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
  clearHomeCountry,
  saveHomeCountry,
  subscribeToHomeCountry,
} from "./homeCountry";

describe("home Country persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.database.ref.mockImplementation((_database, path: string) => ({ path }));
  });

  it("loads a saved Country after reload", () => {
    const onHomeCountry = vi.fn();
    firebase.database.onValue.mockImplementation((_reference, listener) => {
      listener({ val: () => "se" });
      return () => undefined;
    });

    subscribeToHomeCountry("tester", onHomeCountry, vi.fn());

    expect(onHomeCountry).toHaveBeenCalledWith("se");
  });

  it("writes a replacement Country and clears only that Account's setting", async () => {
    await saveHomeCountry("tester", "fr");
    await saveHomeCountry("traveler", "no");
    await clearHomeCountry("tester");

    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/tester/settings/homeCountry" },
      "fr",
    );
    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/traveler/settings/homeCountry" },
      "no",
    );
    expect(firebase.database.remove).toHaveBeenCalledWith({
      path: "users/tester/settings/homeCountry",
    });
  });
});
