import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

it("declares a valid manifest whose icon files exist on disk", () => {
  const publicDir = path.resolve(__dirname, "../../public");
  const manifestPath = path.join(publicDir, "manifest.webmanifest");

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));

  expect(manifest.name).toBe("WorldVisit");
  expect(manifest.short_name).toBe("WorldVisit");
  expect(manifest.start_url).toBe("/app");
  expect(manifest.display).toBe("standalone");
  expect(Array.isArray(manifest.icons)).toBe(true);
  expect(manifest.icons.length).toBeGreaterThan(0);
  expect(
    manifest.icons.some((icon: { purpose?: string }) => icon.purpose === "maskable"),
  ).toBe(true);

  for (const icon of manifest.icons) {
    const iconPath = path.join(publicDir, icon.src.replace(/^\//, ""));
    expect(existsSync(iconPath)).toBe(true);
  }
});