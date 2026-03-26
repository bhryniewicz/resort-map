import Image from "next/image";
import { TILE_MAP, TILE_SIZE } from "@/hooks/use-resort-map";

export interface MapTileProps {
  char: string;
  x: number;
  rows: string[];
  roomNumber: number | undefined;
  isCheckedIn: boolean;
  getPathTile: (
    rows: string[],
    x: number,
    y: number,
  ) => { src: string; rotation: number };
  y: number;
  onCabanaClick: (roomNumber: number, isBooked: boolean) => void;
}

export default function MapTile({
  char,
  x,
  y,
  rows,
  roomNumber,
  isCheckedIn,
  getPathTile,
  onCabanaClick,
}: MapTileProps) {
  const tile = TILE_MAP[char];
  const isPath = char === "#";
  const pathTile = isPath ? getPathTile(rows, x, y) : null;
  const isCabana = char === "W";

  return (
    <div
      style={{
        width: TILE_SIZE,
        height: TILE_SIZE,
        position: "relative",
        ...(tile?.bg && {
          backgroundImage: `url(${tile.bg})`,
          backgroundSize: "cover",
        }),
        ...(isCabana && { cursor: "pointer" }),
        ...(isCheckedIn && {
          backgroundColor: "rgba(239, 68, 68, 0.35)",
          borderRadius: 4,
          boxShadow: "0 0 6px 2px rgba(239, 68, 68, 0.5)",
        }),
      }}
      className="shrink-0"
      onClick={
        isCabana ? () => onCabanaClick(roomNumber!, isCheckedIn) : undefined
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
          style={{
            position: "relative",
            zIndex: 1,
            ...(isCheckedIn && {
              opacity: 0.5,
              filter: "grayscale(0.6) sepia(1) hue-rotate(-50deg) saturate(3)",
            }),
          }}
        />
      ) : null}
    </div>
  );
}
