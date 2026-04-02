import { colord, extend } from "colord";
import labPlugin from "colord/plugins/lab";
import namesPlugin from "colord/plugins/names";

extend([namesPlugin, labPlugin]);

import type { Color } from "./wardrobe/types";

export const CORE_COLORS: Color[] = [
  "black",
  "white",
  "gray",
  "navy",
  "blue",
  "red",
  "green",
  "brown",
  "beige",
  "multi",
];

export const COLOR_HEX: Record<Color, string> = {
  black: "#1a1a1a",
  white: "#f5f5f5",
  gray: "#6b6b6b",
  navy: "#1e3a5f",
  blue: "#2563eb",
  red: "#dc2626",
  green: "#2d5a27",
  brown: "#5c4033",
  beige: "#d4c4a8",
  multi: "#gradient",
};

export function getClosestColor(hex: string): Color {
  const inputColor = colord(hex);
  if (!inputColor.isValid()) return "gray";

  let closestColor: Color = "gray";
  let smallestDistance = Infinity;

  for (const colorName of CORE_COLORS) {
    if (colorName === "multi") continue;

    const targetHex = COLOR_HEX[colorName];
    const targetColor = colord(targetHex);

    const inputLab = inputColor.toLab();
    const targetLab = targetColor.toLab();

    const distance = Math.sqrt(
      Math.pow(inputLab.l - targetLab.l, 2) +
        Math.pow(inputLab.a - targetLab.a, 2) +
        Math.pow(inputLab.b - targetLab.b, 2),
    );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestColor = colorName;
    }
  }

  return closestColor;
}

export function rgbToColor(r: number, g: number, b: number): Color {
  const hex = colord({ r, g, b }).toHex();
  return getClosestColor(hex);
}

export function extractColorsFromImage(imageUrl: string): Promise<Color[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve([]);
        return;
      }

      const size = 50;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);

      const imageData = ctx.getImageData(0, 0, size, size);
      const data = imageData.data;

      const colorCounts: Record<string, { count: number; r: number; g: number; b: number }> = {};

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a < 128) continue;

        if (r > 240 && g > 240 && b > 240) continue;
        if (r < 15 && g < 15 && b < 15) continue;

        const quantizedR = Math.round(r / 32) * 32;
        const quantizedG = Math.round(g / 32) * 32;
        const quantizedB = Math.round(b / 32) * 32;

        const key = `${quantizedR},${quantizedG},${quantizedB}`;

        if (colorCounts[key]) {
          colorCounts[key].count++;
        } else {
          colorCounts[key] = { count: 1, r: quantizedR, g: quantizedG, b: quantizedB };
        }
      }

      const sortedColors = Object.values(colorCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const extractedColors: Color[] = [];

      for (const { r, g, b } of sortedColors) {
        const color = rgbToColor(r, g, b);
        if (!extractedColors.includes(color)) {
          extractedColors.push(color);
        }
        if (extractedColors.length >= 3) break;
      }

      if (extractedColors.length >= 2) {
        extractedColors.push("multi");
      }

      resolve(extractedColors);
    };

    img.onerror = () => resolve([]);
    img.src = imageUrl;
  });
}
