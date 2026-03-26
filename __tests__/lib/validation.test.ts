import { describe, it, expect } from "vitest";
import {
  validateMapContent,
  validateBookingsContent,
} from "@/lib/content-validation";

describe("validateMapContent", () => {
  it("accepts valid map with all allowed characters", () => {
    const content = "..c.#\nWWpp.\n###..\n";
    expect(validateMapContent(content)).toEqual({ valid: true });
  });

  it("rejects map with invalid characters", () => {
    const result = validateMapContent("..X..");
    expect(result).toEqual({
      valid: false,
      error: 'Map file contains unhandled characters: "X"',
    });
  });

  it("rejects space characters", () => {
    const result = validateMapContent(".. ..");
    expect(result).toEqual({
      valid: false,
      error: "Map file contains unhandled characters: space",
    });
  });

  it("rejects wrong file extension when filePath provided", () => {
    const result = validateMapContent("...", "map.txt");
    expect(result).toEqual({
      valid: false,
      error: 'Map file must be an .ascii file, got ".txt".',
    });
  });

  it("accepts .ascii file extension", () => {
    const result = validateMapContent("...", "map.ascii");
    expect(result).toEqual({ valid: true });
  });

  it("accepts content without filePath (no extension check)", () => {
    const result = validateMapContent("...");
    expect(result).toEqual({ valid: true });
  });

  it("reports multiple bad characters", () => {
    const result = validateMapContent("XY");
    expect(result).toEqual({
      valid: false,
      error: 'Map file contains unhandled characters: "X", "Y"',
    });
  });
});

describe("validateBookingsContent", () => {
  it("accepts valid bookings JSON", () => {
    const raw = JSON.stringify([
      { room: "101", guestName: "Alice" },
      { room: "102", guestName: "Bob" },
    ]);
    expect(validateBookingsContent(raw)).toEqual({ valid: true });
  });

  it("rejects invalid JSON", () => {
    const result = validateBookingsContent("not json");
    expect(result).toEqual({
      valid: false,
      error: "Bookings file is not valid JSON.",
    });
  });

  it("rejects empty array", () => {
    const result = validateBookingsContent("[]");
    expect(result).toEqual({
      valid: false,
      error: "Bookings file must be a non-empty JSON array.",
    });
  });

  it("rejects non-array JSON", () => {
    const result = validateBookingsContent('{"room": "101"}');
    expect(result).toEqual({
      valid: false,
      error: "Bookings file must be a non-empty JSON array.",
    });
  });

  it("rejects entry that is not an object", () => {
    const result = validateBookingsContent('["string"]');
    expect(result).toEqual({
      valid: false,
      error: "Bookings entry at index 0 is not an object.",
    });
  });

  it("rejects null entry", () => {
    const result = validateBookingsContent("[null]");
    expect(result).toEqual({
      valid: false,
      error: "Bookings entry at index 0 is not an object.",
    });
  });

  it("rejects array entry", () => {
    const result = validateBookingsContent("[[]]");
    expect(result).toEqual({
      valid: false,
      error: "Bookings entry at index 0 is not an object.",
    });
  });

  it("rejects extra properties", () => {
    const raw = JSON.stringify([{ room: "101", guestName: "Alice", extra: 1 }]);
    const result = validateBookingsContent(raw);
    expect(result).toEqual({
      valid: false,
      error: "Bookings entry at index 0 has unexpected properties: extra",
    });
  });

  it("rejects non-string room", () => {
    const raw = JSON.stringify([{ room: 101, guestName: "Alice" }]);
    const result = validateBookingsContent(raw);
    expect(result).toEqual({
      valid: false,
      error:
        'Bookings entry at index 0 is missing or has invalid "room" (must be a string).',
    });
  });

  it("rejects missing guestName", () => {
    const raw = JSON.stringify([{ room: "101" }]);
    const result = validateBookingsContent(raw);
    expect(result).toEqual({
      valid: false,
      error:
        'Bookings entry at index 0 is missing or has invalid "guestName" (must be a string).',
    });
  });
});
