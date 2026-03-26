import { extname } from "path";
import { ALLOWED_MAP_CHARS, BOOKING_KEYS } from "../types/resort-map.ts";

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMapContent(
  content: string,
  filePath?: string,
): ValidationResult {
  if (filePath && extname(filePath) !== ".ascii") {
    return {
      valid: false,
      error: `Map file must be an .ascii file, got "${extname(filePath) || "(no extension)"}".`,
    };
  }

  const badChars = new Set<string>();
  for (const ch of content) {
    if (!ALLOWED_MAP_CHARS.has(ch)) {
      badChars.add(ch);
    }
  }

  if (badChars.size > 0) {
    const display = [...badChars]
      .map((c) => (c === " " ? "space" : JSON.stringify(c)))
      .join(", ");
    return {
      valid: false,
      error: `Map file contains unhandled characters: ${display}`,
    };
  }

  return { valid: true };
}

export function validateBookingsContent(raw: string): ValidationResult {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return { valid: false, error: "Bookings file is not valid JSON." };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return {
      valid: false,
      error: "Bookings file must be a non-empty JSON array.",
    };
  }

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return {
        valid: false,
        error: `Bookings entry at index ${i} is not an object.`,
      };
    }

    const keys = Object.keys(entry as Record<string, unknown>);
    const extraKeys = keys.filter((k) => !BOOKING_KEYS.has(k));
    if (extraKeys.length > 0) {
      return {
        valid: false,
        error: `Bookings entry at index ${i} has unexpected properties: ${extraKeys.join(", ")}`,
      };
    }

    const obj = entry as Record<string, unknown>;
    for (const key of BOOKING_KEYS) {
      if (typeof obj[key] !== "string") {
        return {
          valid: false,
          error: `Bookings entry at index ${i} is missing or has invalid "${key}" (must be a string).`,
        };
      }
    }
  }

  return { valid: true };
}
