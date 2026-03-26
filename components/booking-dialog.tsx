"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BookingDialogProps {
  selectedRoom: number | null;
  onClose: () => void;
  onBooked: (roomNumber: number) => void;
}

export default function BookingDialog({
  selectedRoom,
  onClose,
  onBooked,
}: BookingDialogProps) {
  const [guestName, setGuestName] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (selectedRoom !== null) {
      setGuestName("");
      setFormError("");
    }
  }, [selectedRoom]);

  const handleSubmit = async () => {
    if (selectedRoom === null) return;

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: String(selectedRoom),
          guestName: guestName.trim(),
          cabanaNumber: selectedRoom,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Booking failed.");
        return;
      }

      onBooked(selectedRoom);
      onClose();
      toast.success(data.message, {
        style: { backgroundColor: "#22c55e", color: "white", border: "none" },
      });
    } catch {
      setFormError("Network error. Please try again.");
    }
  };

  return (
    <Dialog
      open={selectedRoom !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Check In — Cabana {selectedRoom}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="roomNumber"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              Room Number
            </Label>
            <Input
              id="roomNumber"
              value={selectedRoom ?? ""}
              disabled
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="guestName"
              className="text-sm font-medium text-zinc-600 dark:text-zinc-400"
            >
              Guest Name
            </Label>
            <Input
              id="guestName"
              placeholder="e.g. Alice Smith"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                setFormError("");
              }}
            />
            {formError && (
              <p className="text-sm text-red-500 font-medium">{formError}</p>
            )}
          </div>
          <Button
            type="submit"
            className="mt-4 h-12 rounded-xl bg-zinc-900 text-white font-semibold text-base hover:bg-zinc-700 active:bg-zinc-800 transition-colors dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
