export type Coord = [number, number];
export const tuple = <T extends any[]>(...args: T): T => args;

export const coordAdd = (coord1: Coord, coord2: Coord): Coord => [
  coord1[0] + coord2[0],
  coord1[1] + coord2[1],
];
export const coordMult = (coord1: Coord, coord2: Coord): Coord => [
  coord1[0] * coord2[0],
  coord1[1] * coord2[1],
];

export const coordEq = (coord1: Coord, coord2: Coord): boolean =>
  coord1[0] === coord2[0] && coord1[1] === coord2[1];

export const coordCollide = (coord: Coord, coords: Coord[]): boolean => {
  return coords.some(c => coordEq(c, coord));
};

export const coordRotate90 = (coord: Coord): Coord => [coord[1] * -1, coord[0]];
export const coordRotate270 = (coord: Coord): Coord => [
  coord[1],
  coord[0] * -1,
];
export const coordRotate180 = (coord: Coord): Coord => [
  coord[0] * -1,
  coord[1] * -1,
];

export const coordSortAndUniq = (coords: Coord[]): Coord[] => {
  const sorted = coords.sort(([x1, y1], [x2, y2]) =>
    x1 < x2 ? -1 : x1 > x2 ? 1 : y1 < y2 ? -1 : y1 > y2 ? 1 : 0,
  );
  const reduced = sorted.reduce(
    (acc, cord, i, arr) => [
      ...acc,
      ...(!arr[i + 1] ? [cord] : !coordEq(cord, arr[i + 1]) ? [cord] : []),
    ],
    [] as Coord[],
  );
  return reduced;
};
