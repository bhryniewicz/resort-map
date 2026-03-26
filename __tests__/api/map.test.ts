import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockReadFile } = vi.hoisted(() => ({
  mockReadFile: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: { readFile: mockReadFile },
  readFile: mockReadFile,
}));

vi.mock("@/lib/cli-paths", () => ({
  getMapPath: () => "/fake/path/map.ascii",
}));

import { GET } from "@/app/api/map/route";

describe("GET /api/map", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns map content for valid file", async () => {
    const mapContent = "...\n###\nWWW\n";
    mockReadFile.mockResolvedValue(mapContent);

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.map).toBe(mapContent);
  });

  it("returns 400 for invalid map content", async () => {
    mockReadFile.mockResolvedValue("..X..");

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain("unhandled characters");
  });

  it("returns 500 when file cannot be read", async () => {
    mockReadFile.mockRejectedValue(new Error("ENOENT"));

    const res = await GET();
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain("Could not load map file");
  });
});
