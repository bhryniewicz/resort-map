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

import { POST } from "@/app/api/book/route";

const validBookings = JSON.stringify([
  { room: "101", guestName: "Alice Smith" },
  { room: "102", guestName: "Bob Jones" },
]);

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/book", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/book", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBookedCabanas.clear();
    mockReadFile.mockResolvedValue(validBookings);
  });

  it("successfully books a cabana with matching credentials", async () => {
    const req = makeRequest({
      room: "101",
      guestName: "Alice Smith",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toContain("Welcome");
    expect(data.message).toContain("Alice Smith");
    expect(data.cabanaNumber).toBe(301);
    expect(mockBookedCabanas.has(301)).toBe(true);
  });

  it("matches guest name case-insensitively", async () => {
    const req = makeRequest({
      room: "101",
      guestName: "alice smith",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.message).toContain("Alice Smith");
  });

  it("returns 400 when room is missing", async () => {
    const req = makeRequest({
      room: "",
      guestName: "Alice",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toContain("Missing");
  });

  it("returns 400 when guestName is missing", async () => {
    const req = makeRequest({
      room: "101",
      guestName: "",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when cabana is already booked", async () => {
    mockBookedCabanas.add(301);

    const req = makeRequest({
      room: "101",
      guestName: "Alice Smith",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(409);
    expect(data.error).toContain("already booked");
  });

  it("returns 404 when no matching booking found", async () => {
    const req = makeRequest({
      room: "999",
      guestName: "Nobody",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain("No matching booking");
  });

  it("returns 404 when room matches but guest name doesn't", async () => {
    const req = makeRequest({
      room: "101",
      guestName: "Wrong Person",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 500 when bookings file is invalid", async () => {
    mockReadFile.mockResolvedValue("not json");

    const req = makeRequest({
      room: "101",
      guestName: "Alice Smith",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it("trims whitespace from guest name for matching", async () => {
    const req = makeRequest({
      room: "101",
      guestName: "  Alice Smith  ",
      cabanaNumber: 301,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
