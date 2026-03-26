export interface Booking {
  room: string;
  guestName: string;
}

export const ALLOWED_MAP_CHARS = new Set([".", "c", "#", "W", "p", "\n"]);
export const BOOKING_KEYS: ReadonlySet<string> = new Set<keyof Booking>(["room", "guestName"]);
