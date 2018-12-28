import { Coord, tuple, coordSortAndUniq } from './coord';

type Wall = [Coord, Coord];

const getSingleWallCells = (definition: Wall): Coord[] => {
  const X = Math.min(definition[0][0], definition[1][0]);
  const Y = Math.min(definition[0][1], definition[1][1]);
  const W = 1 + Math.abs(definition[0][0] - definition[1][0]);
  const H = 1 + Math.abs(definition[0][1] - definition[1][1]);
  return Array(W * H)
    .fill(undefined)
    .map((_, i) => tuple(X + Math.floor(i / H), Y + (i % H)));
};

export const getWallCells = (definitions: Wall[]): Coord[] => {
  return coordSortAndUniq(
    definitions.reduce<Coord[]>(
      (acc, wallDef) => [...acc, ...getSingleWallCells(wallDef)],
      [],
    ),
  );
};
