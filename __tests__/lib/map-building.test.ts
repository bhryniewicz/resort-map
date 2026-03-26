import { describe, it, expect } from "vitest";
import { useResortMap } from "@/hooks/use-resort-map";

const { assignRoomNumbers, getPathTile } = useResortMap();

describe("assignRoomNumbers", () => {
  it("assigns sequential room numbers to cabanas (W tiles)", () => {
    const rows = ["...", "WW.", ".W."];
    const result = assignRoomNumbers(rows);

    expect(result.get("0,1")).toBe(101);
    expect(result.get("1,1")).toBe(102);
    expect(result.get("1,2")).toBe(103);
  });

  it("does not assign numbers to non-cabana tiles", () => {
    const rows = [".c#", "pW."];
    const result = assignRoomNumbers(rows);

    expect(result.size).toBe(1);
    expect(result.get("1,1")).toBe(101);
  });

  it("increments to next hundredr after 20 rooms", () => {
    const longRow = "W".repeat(21);
    const rows = [longRow];
    const result = assignRoomNumbers(rows);

    expect(result.get("0,0")).toBe(101);
    expect(result.get("19,0")).toBe(120);
    expect(result.get("20,0")).toBe(201);
  });

  it("only numbers cabanas, not chalets or other tiles", () => {
    const rows = [".c.c.", ".###.", ".c.c."];
    const result = assignRoomNumbers(rows);
    expect(result.size).toBe(0);
  });

  it("handles the real map layout correctly", () => {
    const realMap = [
      "....................",
      ".c....c....c......c.",
      ".##################.",
      "...#....c..#.c.c..#.",
      "...#.c....c#.....c#.",
      ".##################.",
      ".#.c...c...#....#c..",
      ".#c....#####c...###.",
      ".#...c.#......c.c.#.",
      ".##################.",
      ".#..................",
      ".#.WWWWWWWWWWWWWW...",
      ".#.WWWppppppppWWW...",
      ".#.WWWppppppppWWW...",
      ".#.WWWppppppppWWW...",
      ".#.WWWWWWWWWWWWWWW..",
      ".################...",
      "....................",
      "....................",
    ];
    const result = assignRoomNumbers(realMap);

    // First W is at row 11, col 3
    expect(result.get("3,11")).toBe(101);

    // All cabanas should be numbered
    let count = 0;
    for (const row of realMap) {
      for (const ch of row) {
        if (ch === "W") count++;
      }
    }
    expect(result.size).toBe(count);
  });
});

describe("getPathTile", () => {
  it("returns crossing for 4-way connection", () => {
    const rows = [".#.", "###", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowCrossing.png");
    expect(result.rotation).toBe(0);
  });

  it("returns straight vertical for up-down connection", () => {
    const rows = [".#.", ".#.", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowStraight.png");
    expect(result.rotation).toBe(0);
  });

  it("returns straight horizontal for left-right connection", () => {
    const rows = ["...", "###", "..."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowStraight.png");
    expect(result.rotation).toBe(90);
  });

  it("returns corner for up-right connection", () => {
    const rows = [".#.", ".#.", "..."];
    const result = getPathTile(rows, 0, 1);
    // At (0,1): up=(0,0)='.', down=(0,2)='.', left=out of bounds='.', right=(1,1)='#'
    // Only right connects => end tile
    expect(result.src).toBe("/arrowEnd.png");
  });

  it("returns end tile for single connection downward", () => {
    const rows = [".#.", "...", "..."];
    const result = getPathTile(rows, 1, 0);
    // At (1,0): up=out of bounds, down=(1,1)='.', left='.', right='.'
    // No connections - fallback
    expect(result.src).toBe("/arrowCrossing.png"); // fallback for 0 connections
  });

  it("connects to buildings (W and c)", () => {
    const rows = [".W.", ".#.", ".c."];
    const result = getPathTile(rows, 1, 1);
    // up connects to W (building), down connects to c (building with no path below)
    expect(result.src).toBe("/arrowStraight.png");
    expect(result.rotation).toBe(0);
  });

  it("returns split for 3-way connection (missing left)", () => {
    const rows = [".#.", ".##", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowSplit.png");
    expect(result.rotation).toBe(0);
  });

  it("returns split for 3-way connection (missing up)", () => {
    const rows = ["...", "###", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowSplit.png");
    expect(result.rotation).toBe(90);
  });

  it("returns corner for down-right connection", () => {
    const rows = ["...", ".##", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowCornerSquare.png");
    expect(result.rotation).toBe(90);
  });

  it("returns corner for down-left connection", () => {
    const rows = ["...", "##.", ".#."];
    const result = getPathTile(rows, 1, 1);
    expect(result.src).toBe("/arrowCornerSquare.png");
    expect(result.rotation).toBe(180);
  });

  it("handles edge of map (out of bounds treated as empty)", () => {
    const rows = ["#"];
    const result = getPathTile(rows, 0, 0);
    // All neighbors out of bounds = 0 connections = fallback crossing
    expect(result.src).toBe("/arrowCrossing.png");
  });
});
