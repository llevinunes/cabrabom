"use client";

import { useState } from "react";
import { DEFAULT_RADIUS_KM, MAX_RADIUS_KM } from "@/lib/search/params";

/** "Raio de busca" slider of screen 01: 1–100 km, 10 km by default. */
export function RadiusControl({ defaultValue = DEFAULT_RADIUS_KM }: { defaultValue?: number }) {
  const [radius, setRadius] = useState(defaultValue);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor="radius" className="text-sm font-semibold">
          Raio de busca
        </label>
        <output htmlFor="radius" className="text-lg font-extrabold">
          {radius} km
        </output>
      </div>
      <input
        id="radius"
        name="radius"
        type="range"
        min={1}
        max={MAX_RADIUS_KM}
        value={radius}
        onChange={(event) => setRadius(Number(event.target.value))}
        className="radius-range h-11 w-full"
        style={{ "--fill": `${((radius - 1) / (MAX_RADIUS_KM - 1)) * 100}%` } as React.CSSProperties}
      />
      <div className="flex justify-between text-xs text-secundario" aria-hidden="true">
        <span>1 km</span>
        <span>{MAX_RADIUS_KM} km</span>
      </div>
    </div>
  );
}
