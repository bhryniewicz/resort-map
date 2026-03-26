"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import BookingDialog from "@/components/booking-dialog";
import { useResortMap } from "@/hooks/use-resort-map";
import MapRow from "./map-row";

export default function ResortMap() {
  const [asciiMap, setAsciiMap] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const { getPathTile, assignRoomNumbers } = useResortMap();

  useEffect(() => {
    async function loadData() {
      try {
        const [mapRes, bookingsRes] = await Promise.all([
          fetch("/api/map"),
          fetch("/api/bookings"),
        ]);

        if (!mapRes.ok) {
          throw new Error("Failed to load map.");
        }

        if (!bookingsRes.ok) {
          throw new Error("Failed to load bookings.");
        }

        const mapData = await mapRes.json();
        const bookingsData = await bookingsRes.json();

        console.log(bookingsData, "booksingsData");

        setAsciiMap(mapData.map);
        setCheckedIn(new Set(bookingsData.bookedCabanas));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <p className="text-zinc-500">Loading resort map...</p>;
  }

  if (error || !asciiMap) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <strong>Error: </strong>
        {error || "Could not load resort data."}
      </div>
    );
  }

  const rows = asciiMap.split("\n").filter((line) => line.length > 0);
  const roomNumbers = assignRoomNumbers(rows);

  const handleCabanaClick = (roomNumber: number, isBooked: boolean) => {
    if (isBooked) {
      toast.error(`Room ${roomNumber} is already booked!`, {
        style: {
          backgroundColor: "#ef4444",
          color: "white",
          border: "none",
        },
      });
      return;
    }
    setSelectedRoom(roomNumber);
  };

  return (
    <>
      <div
        className="inline-flex flex-col"
        style={{
          backgroundImage: "url(/parchmentBasic.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {rows.map((row, y) => (
          <MapRow
            key={y}
            row={row}
            y={y}
            rows={rows}
            roomNumbers={roomNumbers}
            checkedIn={checkedIn}
            getPathTile={getPathTile}
            onCabanaClick={handleCabanaClick}
          />
        ))}
      </div>

      <BookingDialog
        selectedRoom={selectedRoom}
        onClose={() => setSelectedRoom(null)}
        onBooked={(roomNumber) =>
          setCheckedIn((prev) => new Set(prev).add(roomNumber))
        }
      />
    </>
  );
}
