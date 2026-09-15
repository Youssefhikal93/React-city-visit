import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StoredCity } from "../types";

const database = vi.hoisted(() => ({
  get: vi.fn(),
  onValue: vi.fn(),
  push: vi.fn(),
  ref: vi.fn(),
  remove: vi.fn(),
  serverTimestamp: vi.fn(),
  update: vi.fn(),
}));

vi.mock("firebase/database", () => database);
vi.mock("./firebase", () => ({ db: {} }));

import { addMemory, deleteMemory, normalizeCity } from "./cities";

function storedCitySnapshot(city: StoredCity) {
  return {
    exists: () => true,
    val: () => city,
  };
}

describe("City Memory writes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    database.ref.mockImplementation((_database, path: string) => ({ path }));
  });

  it("moves a legacy image and adds a Memory in one City update", async () => {
    database.get.mockResolvedValue(
      storedCitySnapshot({ image: "data:image/jpeg;base64,legacy" })
    );
    database.push.mockReturnValue({ key: "memory-new" });

    await addMemory("tester", "stockholm", "data:image/jpeg;base64,new");

    expect(database.update).toHaveBeenCalledTimes(1);
    expect(database.update).toHaveBeenCalledWith(
      { path: "users/tester/cities/stockholm" },
      {
        memories: {
          "legacy-image": "data:image/jpeg;base64,legacy",
          "memory-new": "data:image/jpeg;base64,new",
        },
        image: null,
      }
    );
  });

  it("clears a deleted legacy image in one City update", async () => {
    database.get.mockResolvedValue(
      storedCitySnapshot({ image: "data:image/jpeg;base64,legacy" })
    );

    await deleteMemory("tester", "stockholm", "legacy-image");

    expect(database.update).toHaveBeenCalledTimes(1);
    expect(database.update).toHaveBeenCalledWith(
      { path: "users/tester/cities/stockholm" },
      { memories: {}, image: null }
    );
  });

  it("leaves Cities without a legacy image on their existing write paths", async () => {
    database.get.mockResolvedValue(storedCitySnapshot({ memories: {} }));
    database.push.mockResolvedValue({ key: "memory-new" });

    await addMemory("tester", "stockholm", "data:image/jpeg;base64,new");
    await deleteMemory("tester", "stockholm", "memory-new");

    expect(database.update).not.toHaveBeenCalled();
    expect(database.remove).toHaveBeenCalledWith({
      path: "users/tester/cities/stockholm/memories/memory-new",
    });
  });
});

describe("normalizeCity", () => {
  it("turns a legacy image into one Memory", () => {
    const city = normalizeCity("stockholm", {
      cityName: "Stockholm",
      image: "data:image/jpeg;base64,legacy",
    });

    expect(city.memories).toEqual([
      { id: "legacy-image", dataUri: "data:image/jpeg;base64,legacy" },
    ]);
  });

  it("uses keyed Memories in key order", () => {
    const city = normalizeCity("stockholm", {
      memories: {
        "-second": "data:image/jpeg;base64,second",
        "-first": "data:image/jpeg;base64,first",
      },
    });

    expect(city.memories).toEqual([
      { id: "-first", dataUri: "data:image/jpeg;base64,first" },
      { id: "-second", dataUri: "data:image/jpeg;base64,second" },
    ]);
  });

  it("uses an empty Memory list when neither shape is stored", () => {
    expect(normalizeCity("stockholm", {}).memories).toEqual([]);
  });
});
