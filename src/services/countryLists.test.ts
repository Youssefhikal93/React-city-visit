import { beforeEach, describe, expect, it, vi } from "vitest";

const firebase = vi.hoisted(() => ({
  database: {
    onValue: vi.fn(),
    ref: vi.fn(),
    remove: vi.fn(),
    set: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("firebase/app", () => ({ initializeApp: vi.fn(() => ({})) }));
vi.mock("firebase/auth", () => ({ getAuth: vi.fn(() => ({})) }));
vi.mock("firebase/database", () => ({
  ...firebase.database,
  getDatabase: vi.fn(() => ({})),
}));

import {
  addCountryToList,
  removeCountryFromList,
  subscribeToCountryLists,
} from "./countryLists";

function emitSettings(settings: unknown) {
  firebase.database.onValue.mockImplementation((_reference, listener) => {
    listener({ val: () => settings });
    return () => undefined;
  });
}

describe("Account Country list persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebase.database.ref.mockImplementation((_database, path: string) => ({ path }));
    firebase.database.update.mockResolvedValue(undefined);
  });

  it("loads both lists sorted and ignores malformed entries", () => {
    const onLists = vi.fn();
    emitSettings({
      livedInCountries: { se: true, eg: true, France: true, no: false },
      plannedCountries: { jp: true, is: true },
    });

    subscribeToCountryLists("tester", onLists, vi.fn());

    expect(onLists).toHaveBeenCalledWith({
      livedInCountryCodes: ["eg", "se"],
      plannedCountryCodes: ["is", "jp"],
    });
    expect(firebase.database.update).not.toHaveBeenCalled();
  });

  it("reports a legacy home and planned Country in the lists and moves them there", () => {
    const onLists = vi.fn();
    emitSettings({
      homeCountry: "se",
      plannedCountry: "is",
      plannedCountries: { jp: true },
    });

    subscribeToCountryLists("tester", onLists, vi.fn());

    expect(onLists).toHaveBeenCalledWith({
      livedInCountryCodes: ["se"],
      plannedCountryCodes: ["is", "jp"],
    });
    expect(firebase.database.update).toHaveBeenCalledWith(
      { path: "users/tester/settings" },
      {
        "livedInCountries/se": true,
        homeCountry: null,
        "plannedCountries/is": true,
        plannedCountry: null,
      },
    );
  });

  it("drops a malformed legacy value without adding it to a list", () => {
    const onLists = vi.fn();
    emitSettings({ homeCountry: "Sweden" });

    subscribeToCountryLists("tester", onLists, vi.fn());

    expect(onLists).toHaveBeenCalledWith({
      livedInCountryCodes: [],
      plannedCountryCodes: [],
    });
    expect(firebase.database.update).toHaveBeenCalledWith(
      { path: "users/tester/settings" },
      { homeCountry: null },
    );
  });

  it("adds and removes one Country in the chosen list only", async () => {
    await addCountryToList("tester", "livedIn", "fr");
    await addCountryToList("traveler", "planned", "no");
    await removeCountryFromList("tester", "planned", "is");

    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/tester/settings/livedInCountries/fr" },
      true,
    );
    expect(firebase.database.set).toHaveBeenCalledWith(
      { path: "users/traveler/settings/plannedCountries/no" },
      true,
    );
    expect(firebase.database.remove).toHaveBeenCalledWith({
      path: "users/tester/settings/plannedCountries/is",
    });
  });

  it("rejects an invalid Country code", async () => {
    await expect(addCountryToList("tester", "livedIn", "France")).rejects.toThrow(
      "Choose a valid Country.",
    );
    expect(firebase.database.set).not.toHaveBeenCalled();
  });
});
