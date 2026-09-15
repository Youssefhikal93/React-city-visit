import { describe, expect, it } from "vitest";
import { vi } from "vitest";

vi.mock("./firebase", () => ({ db: {} }));

import { normalizeCity } from "./cities";

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
