import { resolve } from "path";
import { readFileSync } from "fs";
import {
  validateMapContent,
  validateBookingsContent,
} from "../lib/content-validation.ts";

const mapPath = resolve(
  process.cwd(),
  process.env.MAP_PATH || "data/map.ascii",
);
const bookingsPath = resolve(
  process.cwd(),
  process.env.BOOKINGS_PATH || "data/bookings.json",
);

const mapContent = readFileSync(mapPath, "utf-8");
const mapResult = validateMapContent(mapContent, mapPath);
if (!mapResult.valid) {
  console.error(`Map error: ${mapResult.error}`);
  process.exit(1);
}

const bookingsContent = readFileSync(bookingsPath, "utf-8");
const bookingsResult = validateBookingsContent(bookingsContent);
if (!bookingsResult.valid) {
  console.error(`Bookings error: ${bookingsResult.error}`);
  process.exit(1);
}
