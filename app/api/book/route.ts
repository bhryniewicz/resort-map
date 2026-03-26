import { readFile } from "fs/promises";
import { getBookingsPath } from "@/lib/cli-paths";
import { validateBookingsContent } from "@/lib/content-validation";
import { bookedCabanas } from "../_state";

interface Booking {
  room: string;
  guestName: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { room, guestName, cabanaNumber } = body as {
      room: string;
      guestName: string;
      cabanaNumber: number;
    };

    if (!room || !guestName) {
      return Response.json(
        { error: "Missing room number, guestName" },
        { status: 400 },
      );
    }

    if (bookedCabanas.has(cabanaNumber)) {
      return Response.json(
        { error: `Cabana ${cabanaNumber} is already booked.` },
        { status: 409 },
      );
    }

    const bookingsPath = getBookingsPath();
    const raw = await readFile(bookingsPath, "utf-8");

    const result = validateBookingsContent(raw);
    if (!result.valid) {
      return Response.json({ error: result.error }, { status: 500 });
    }

    const bookings = JSON.parse(raw) as Booking[];
    const match = bookings.find(
      (b) =>
        b.room === room &&
        b.guestName.toLowerCase() === guestName.trim().toLowerCase(),
    );

    if (!match) {
      return Response.json(
        { error: "No matching booking found for this room and guest name." },
        { status: 404 },
      );
    }

    bookedCabanas.add(cabanaNumber);

    return Response.json({
      message: `Welcome, ${match.guestName}! Checked into cabana ${cabanaNumber}.`,
      cabanaNumber,
    });
  } catch {
    return Response.json(
      { error: "Failed to process booking." },
      { status: 500 },
    );
  }
}
