import MapTile from "./map-tile";

export interface MapRowProps {
  row: string;
  y: number;
  rows: string[];
  roomNumbers: Map<string, number>;
  checkedIn: Set<number>;
  getPathTile: (
    rows: string[],
    x: number,
    y: number,
  ) => { src: string; rotation: number };
  onCabanaClick: (roomNumber: number, isBooked: boolean) => void;
}

export default function MapRow({
  row,
  y,
  rows,
  roomNumbers,
  checkedIn,
  getPathTile,
  onCabanaClick,
}: MapRowProps) {
  return (
    <div className="flex">
      {[...row].map((char, x) => {
        const isCabana = char === "W";
        const roomNumber = isCabana
          ? roomNumbers.get(`${x},${y}`)
          : undefined;
        const isCheckedIn =
          roomNumber !== undefined && checkedIn.has(roomNumber);

        return (
          <MapTile
            key={x}
            char={char}
            x={x}
            y={y}
            rows={rows}
            roomNumber={roomNumber}
            isCheckedIn={isCheckedIn}
            getPathTile={getPathTile}
            onCabanaClick={onCabanaClick}
          />
        );
      })}
    </div>
  );
}
