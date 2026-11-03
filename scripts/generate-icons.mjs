// Generates the PWA and favicon PNGs from the SVGs in design/ (design guide, section 2.3).
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const main = "design/logo.svg";
const minimal = "design/icon-minimal.svg";

const outputs = [
  { source: main, size: 512, path: "public/icons/icon-512.png" },
  { source: main, size: 192, path: "public/icons/icon-192.png" },
  { source: main, size: 180, path: "app/apple-icon.png" },
  { source: minimal, size: 32, path: "app/icon.png" },
];

await mkdir("public/icons", { recursive: true });

for (const { source, size, path } of outputs) {
  await sharp(source, { density: 300 }).resize(size, size).png().toFile(path);
  console.log(`${path} (${size}px)`);
}
