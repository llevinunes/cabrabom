import sharp from "sharp";
import { describe, expect, it } from "vitest";

describe("apple-icon.png", () => {
  // iOS rounds the icon itself and paints transparent pixels black.
  it("is a square 180x180 with no transparency", async () => {
    const image = sharp("app/apple-icon.png");
    const { width, height } = await image.metadata();
    const { isOpaque } = await image.stats();
    expect([width, height]).toEqual([180, 180]);
    expect(isOpaque).toBe(true);
  });
});
