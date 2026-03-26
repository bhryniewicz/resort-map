import { resolve } from "path";

export function getMapPath(): string {
  const custom = process.env.MAP_PATH;
  return custom
    ? resolve(process.cwd(), custom)
    : resolve(process.cwd(), "data/map.ascii");
}

export function getBookingsPath(): string {
  const custom = process.env.BOOKINGS_PATH;
  return custom
    ? resolve(process.cwd(), custom)
    : resolve(process.cwd(), "data/bookings.json");
}
