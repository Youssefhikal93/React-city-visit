import { describe, expect, it } from "vitest";

import { fitWithinLongSide } from "./memoryDimensions";

describe("fitWithinLongSide", () => {
  it("clamps a landscape Memory by its width", () => {
    expect(fitWithinLongSide(1600, 1200, 800)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it("clamps a portrait Memory by its height", () => {
    expect(fitWithinLongSide(1200, 1600, 800)).toEqual({
      width: 600,
      height: 800,
    });
  });

  it("keeps an already-small Memory unchanged", () => {
    expect(fitWithinLongSide(640, 480, 800)).toEqual({
      width: 640,
      height: 480,
    });
  });
});
