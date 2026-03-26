import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockReadFile, mockBookedCabanas } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
  mockBookedCabanas: new Set<number>(),
}));

vi.mock("fs/promises", () => ({
  default: { readFile: mockReadFile },
  readFile: mockReadFile,
}));

vi.mock("@/lib/cli-paths", () => ({
  getBookingsPath: () => "/fake/bookings.json",
}));

vi.mock("@/app/api/_state", () => ({
  bookedCabanas: mockBookedCabanas,
}));

import { GET } from "@/app/api/bookings/route";

describe("GET /api/bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookedCabanas.clear();
  });

  it("returns bookings and empty bookedCabanas", async () => {
    const bookings = [{ room: "101", guestName: "Alice" }];
    mockReadFile.mockResolvedValue(JSON.stringify(bookings));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.bookings).toEqual(bookings);
    expect(data.bookedCabanas).toEqual([]);
  });

  it("includes booked cabana numbers in response", async () => {
    mockBookedCabanas.add(101);
    mockBookedCabanas.add(205);
    const bookings = [{ room: "101", guestName: "Alice" }];
    mockReadFile.mockResolvedValue(JSON.stringify(bookings));

    const res = await GET();
    const data = await res.json();

    expect(data.bookedCabanas).toContain(101);
    expect(data.bookedCabanas).toContain(205);
  });

  it("returns 400 for invalid bookings JSON", async () => {
    mockReadFile.mockResolvedValue("not json");

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 500 when file cannot be read", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Could not load bookings file");
  });
});
