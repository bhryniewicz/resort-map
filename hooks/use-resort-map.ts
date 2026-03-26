export const TILE_SIZE = 32;

export const TILE_MAP: Record<
  string,
  { src: string; alt: string; bg?: string } | null
> = {
  W: { src: "/cabana.png", alt: "Cabana" },
  p: { src: "/pool.png", alt: "Pool", bg: "/textureWater.png" },
  c: { src: "/houseChimney.png", alt: "Chalet" },
  ".": null,
};

export const useResortMap = () => {
  function getPathTile(
    rows: string[],
    x: number,
    y: number,
  ): { src: string; rotation: number } {
    const charAt = (px: number, py: number) => {
      if (py < 0 || py >= rows.length || px < 0 || px >= rows[py].length)
        return ".";
      return rows[py][px];
    };

    const isBuilding = (ch: string) => ch === "c" || ch === "W";

    const connectsUp = () => {
      const ch = charAt(x, y - 1);
      if (ch === "#") return true;
      if (isBuilding(ch)) return true;
      return false;
    };

    const connectsDown = () => {
      const ch = charAt(x, y + 1);
      if (ch === "#") return true;
      if (!isBuilding(ch)) return false;
      return charAt(x, y + 2) !== "#";
    };

    const connectsSide = (px: number, py: number) => {
      const ch = charAt(px, py);
      if (ch === "#") return true;
      if (!isBuilding(ch)) return false;
      const hasAbovePath = charAt(px, py - 1) === "#";
      const hasBelowPath = charAt(px, py + 1) === "#";
      return !hasAbovePath && !hasBelowPath;
    };

    const up = connectsUp();
    const down = connectsDown();
    const left = connectsSide(x - 1, y);
    const right = connectsSide(x + 1, y);

    const count = [up, down, left, right].filter(Boolean).length;

    if (count === 4) {
      return { src: "/arrowCrossing.png", rotation: 0 };
    }

    if (count === 3) {
      if (!left) return { src: "/arrowSplit.png", rotation: 0 };
      if (!up) return { src: "/arrowSplit.png", rotation: 90 };
      if (!right) return { src: "/arrowSplit.png", rotation: 180 };
      if (!down) return { src: "/arrowSplit.png", rotation: 270 };
    }

    if (count === 2) {
      if (up && down) return { src: "/arrowStraight.png", rotation: 0 };
      if (left && right) return { src: "/arrowStraight.png", rotation: 90 };

      if (up && left) return { src: "/arrowCornerSquare.png", rotation: 270 };
      if (up && right) return { src: "/arrowCornerSquare.png", rotation: 0 };
      if (down && right) return { src: "/arrowCornerSquare.png", rotation: 90 };
      if (down && left) return { src: "/arrowCornerSquare.png", rotation: 180 };
    }

    if (count === 1) {
      if (down) return { src: "/arrowEnd.png", rotation: 0 };
      if (left) return { src: "/arrowEnd.png", rotation: 90 };
      if (up) return { src: "/arrowEnd.png", rotation: 180 };
      if (right) return { src: "/arrowEnd.png", rotation: 270 };
    }

    return { src: "/arrowCrossing.png", rotation: 0 };
  }

  function assignRoomNumbers(rows: string[]): Map<string, number> {
    const roomMap = new Map<string, number>();
    let floor = 1;
    let offset = 1;

    for (let y = 0; y < rows.length; y++) {
      for (let x = 0; x < rows[y].length; x++) {
        if (rows[y][x] === "W") {
          roomMap.set(`${x},${y}`, floor * 100 + offset);
          offset++;
          if (offset > 20) {
            floor++;
            offset = 1;
          }
        }
      }
    }

    return roomMap;
  }

  return { getPathTile, assignRoomNumbers };
};
