import { expect, test } from "vitest";
import { readLocationInput } from "@/lib/location/form";

const form = (entries: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(entries)) data.set(key, value);
  return data;
};

test("reads a GPS position", () => {
  expect(readLocationInput(form({ location_kind: "gps", location_lat: "-7.22", location_lng: "-35.9" }))).toEqual({
    kind: "gps",
    lat: -7.22,
    lng: -35.9,
  });
});

test("reads a CEP", () => {
  expect(readLocationInput(form({ location_kind: "cep", location_cep: "58400-000" }))).toEqual({
    kind: "cep",
    cep: "58400-000",
  });
});

test("returns null when nothing usable was sent", () => {
  expect(readLocationInput(form({}))).toBeNull();
  expect(readLocationInput(form({ location_kind: "gps", location_lat: "abc", location_lng: "1" }))).toBeNull();
  expect(readLocationInput(form({ location_kind: "gps", location_lat: "-95", location_lng: "1" }))).toBeNull();
  expect(readLocationInput(form({ location_kind: "cep", location_cep: " " }))).toBeNull();
  expect(readLocationInput(form({ location_kind: "gps" }))).toBeNull();
  expect(readLocationInput(form({ location_kind: "gps", location_lat: "", location_lng: "" }))).toBeNull();
});
