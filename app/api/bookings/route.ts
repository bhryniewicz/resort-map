import { readFile } from "fs/promises";
import { getBookingsPath } from "@/lib/cli-paths";
import { validateBookingsContent } from "@/lib/content-validation";
import { bookedCabanas } from "../_state";

interface Booking {
  room: string;
  guestName: string;
}

export async function GET() {
  try {
    const bookingsPath = getBookingsPath();
    const raw = await readFile(bookingsPath, "utf-8");

    const result = validateBookingsContent(raw);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    const bookings = JSON.parse(raw) as Booking[];

    return Response.json({
      bookings,
      bookedCabanas: Array.from(bookedCabanas),
    });
  } catch {
    return Response.json(
      { error: "Could not load bookings file." },
      { status: 500 },
    );
  }
}
