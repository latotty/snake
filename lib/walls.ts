import { Coord, tuple } from './coord';

export type Wall = [Coord, Coord];
export type WallFn = (width: number, height: number) => Wall[];
export interface WallsDef {
  name: string;
  key: string;
  value: WallFn;
}

const WALLS_FULL: WallFn = (width: number, height: number) => [
  tuple(tuple(0, 0), tuple(0, height - 2)), // LEFT
  tuple(tuple(0, height - 1), tuple(width - 2, height - 1)), // BOTTOM
  tuple(tuple(width - 1, height - 1), tuple(width - 1, 1)), // RIGHT
  tuple(tuple(width - 1, 0), tuple(1, 0)), // TOP
];

const WALLS_NO: WallFn = () => [];

const WALLS_CORNERS: WallFn = (width: number, height: number) => [
  tuple(tuple(0, 0), tuple(0, Math.floor(height / 4))), // LEFT_TOP
  tuple(tuple(0, height - Math.floor(height / 4) - 1), tuple(0, height - 1)), // LEFT_BOTTOM
  tuple(tuple(0, height - 1), tuple(Math.floor(width / 4), height - 1)), // BOTTOM_LEFT
  tuple(
    tuple(width - Math.floor(width / 4) - 1, height - 1),
    tuple(width - 2, height - 1),
  ), // BOTTOM_RIGHT
  tuple(
    tuple(width - 1, height - 1),
    tuple(width - 1, height - Math.floor(height / 4) - 1),
  ), // RIGHT_TOP
  tuple(tuple(width - 1, Math.floor(height / 4)), tuple(width - 1, 1)), // RIGHT_BOTTOM
  tuple(tuple(width - 1, 0), tuple(width - Math.floor(width / 4) - 1, 0)), // TOP_RIGHT
  tuple(tuple(Math.floor(width / 4), 0), tuple(1, 0)), // TOP_LEFT
];

const WALLS_CROSS: WallFn = (width: number, height: number) => [
  tuple(
    tuple(Math.floor(width / 2) - 1, 0),
    tuple(Math.ceil(width / 2), height - 1),
  ), // TOP-BOTTOM
  tuple(
    tuple(0, Math.floor(height / 2) - 1),
    tuple(width - 1, Math.ceil(height / 2)),
  ), // LEFT-RIGHT
];

export const WALLS: WallsDef[] = [
  {
    name: 'Corners',
    key: 'corners',
    value: WALLS_CORNERS,
  },
  {
    name: 'Cross',
    key: 'cross',
    value: WALLS_CROSS,
  },
  {
    name: 'Full',
    key: 'full',
    value: WALLS_FULL,
  },
  {
    name: 'No',
    key: 'no',
    value: WALLS_NO,
  },
];

export const getWallsByKey = (key: string) =>
  WALLS.find(wall => wall.key === key);

export const getWallsDefByWalls = (
  currentWalls: Wall[],
  boardWidth: number,
  boardHeight: number,
): WallsDef | undefined => {
  const currentWallsJSON = JSON.stringify(currentWalls);
  const def = WALLS.find(wallsDef => {
    const walls = wallsDef.value(boardWidth, boardHeight);
    return (
      walls.length === currentWalls.length &&
      JSON.stringify(walls) === currentWallsJSON
    );
  });
  return def;
};

export const validateWalls = (walls: Wall[]) =>
  Array.isArray(walls) &&
  walls.every(
    wall =>
      Array.isArray(wall) &&
      wall.every(
        cell =>
          Array.isArray(cell) &&
          cell.length === 2 &&
          cell.every(num => Number.isInteger(num) && num >= 0),
      ),
  );
