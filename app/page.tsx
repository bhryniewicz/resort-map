"use client";

import Image from "next/image";

const TILE_SIZE = 32;

const TILE_MAP: Record<
  string,
  { src: string; alt: string; bg?: string } | null
> = {
  W: { src: "/cabana.png", alt: "Cabana" },
  p: { src: "/pool.png", alt: "Pool", bg: "/textureWater.png" },
  c: { src: "/houseChimney.png", alt: "Chalet" },
  ".": null,
};

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

  // Each building gets ONE entry only:
  //   1. Prefer bottom entry (path below the building)
  //   2. Fall back to top entry if no path below
  //   3. Horizontal only if no vertical path exists at all

  // Checking UP: building at (x, y-1) — we are its bottom entry (preferred) → always connect
  // Checking DOWN: building at (x, y+1) — we are its top entry → only if no path below it
  const connectsUp = () => {
    const ch = charAt(x, y - 1);
    if (ch === "#") return true;
    if (isBuilding(ch)) return true; // we're the building's bottom entry (preferred)
    return false;
  };

  const connectsDown = () => {
    const ch = charAt(x, y + 1);
    if (ch === "#") return true;
    if (!isBuilding(ch)) return false;
    // We'd be the building's top entry — only if it has no path below (no bottom entry)
    return charAt(x, y + 2) !== "#";
  };

  const connectsSide = (px: number, py: number) => {
    const ch = charAt(px, py);
    if (ch === "#") return true;
    if (!isBuilding(ch)) return false;
    // Horizontal only if building has no vertical path at all
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
    // T-junction: base image connects UP, DOWN, RIGHT (wall on LEFT)
    if (!left) return { src: "/arrowSplit.png", rotation: 0 };
    if (!up) return { src: "/arrowSplit.png", rotation: 90 };
    if (!right) return { src: "/arrowSplit.png", rotation: 180 };
    if (!down) return { src: "/arrowSplit.png", rotation: 270 };
  }

  if (count === 2) {
    // Straight paths
    if (up && down) return { src: "/arrowStraight.png", rotation: 0 };
    if (left && right) return { src: "/arrowStraight.png", rotation: 90 };

    // Corners: base image connects UP and LEFT
    if (up && left) return { src: "/arrowCornerSquare.png", rotation: 270 };
    if (up && right) return { src: "/arrowCornerSquare.png", rotation: 0 };
    if (down && right) return { src: "/arrowCornerSquare.png", rotation: 90 };
    if (down && left) return { src: "/arrowCornerSquare.png", rotation: 180 };
  }

  if (count === 1) {
    // Dead end: base image has opening at BOTTOM
    if (down) return { src: "/arrowEnd.png", rotation: 0 };
    if (left) return { src: "/arrowEnd.png", rotation: 90 };
    if (up) return { src: "/arrowEnd.png", rotation: 180 };
    if (right) return { src: "/arrowEnd.png", rotation: 270 };
  }

  // Isolated path tile — fallback to crossing
  return { src: "/arrowCrossing.png", rotation: 0 };
}

function assignRoomNumbers(rows: string[]): Map<string, number> {
  const roomMap = new Map<string, number>();
  let floor = 1;
  let offset = 0;

  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      if (rows[y][x] === "W") {
        roomMap.set(`${x},${y}`, floor * 100 + offset);
        offset++;
        if (offset > 20) {
          floor++;
          offset = 0;
        }
      }
    }
  }

  return roomMap;
}

function ResortMap({ asciiMap }: { asciiMap: string }) {
  const rows = asciiMap.split("\n").filter((line) => line.length > 0);
  const roomNumbers = assignRoomNumbers(rows);

  return (
    <div
      className="inline-flex flex-col"
      style={{
        backgroundImage: "url(/parchmentBasic.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {rows.map((row, y) => (
        <div key={y} className="flex">
          {[...row].map((char, x) => {
            const tile = TILE_MAP[char];
            const isPath = char === "#";
            const pathTile = isPath ? getPathTile(rows, x, y) : null;
            const isCabana = char === "W";
            const roomNumber = isCabana
              ? roomNumbers.get(`${x},${y}`)
              : undefined;

            return (
              <div
                key={x}
                style={{
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  position: "relative",
                  ...(tile?.bg && {
                    backgroundImage: `url(${tile.bg})`,
                    backgroundSize: "cover",
                  }),
                  ...(isCabana && { cursor: "pointer" }),
                }}
                className="shrink-0"
                onClick={
                  isCabana
                    ? () => console.log(`Room ${roomNumber}`)
                    : undefined
                }
                title={isCabana ? `Room ${roomNumber}` : undefined}
              >
                {isPath && pathTile ? (
                  <Image
                    src={pathTile.src}
                    alt="Path"
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    style={{
                      position: "relative",
                      zIndex: 1,
                      transform: pathTile.rotation
                        ? `rotate(${pathTile.rotation}deg)`
                        : undefined,
                    }}
                  />
                ) : tile ? (
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    style={{ position: "relative", zIndex: 1 }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

const ASCII_MAP = `....................
.c....c....c......c.
.##################.
...#....c..#.c.c..#.
...#.c....c#.....c#.
.##################.
.#.c...c...#....#c..
.#c....#####c...###.
.#...c.#......c.c.#.
.##################.
.#..................
.#.WWWWWWWWWWWWWW...
.#.WWWppppppppWWW...
.#.WWWppppppppWWW...
.#.WWWppppppppWWW...
.#.WWWWWWWWWWWWWWW..
.################...
....................
....................`;

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-semibold mb-6 text-black dark:text-zinc-50">
          Resort Map
        </h1>
        <ResortMap asciiMap={ASCII_MAP} />
      </main>
    </div>
  );
}
