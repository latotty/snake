import { Coord, tuple } from './coord';

type Wall = [Coord, Coord];

const WALLS_FULL = [
  tuple(tuple(0, 0), tuple(0, 38)), // LEFT
  tuple(tuple(0, 39), tuple(38, 39)), // BOTTOM
  tuple(tuple(39, 39), tuple(39, 1)), // RIGHT
  tuple(tuple(39, 0), tuple(1, 0)), // TOP
];

const WALLS_NO: Wall[] = [];

const WALLS_CORNERS = [
  tuple(tuple(0, 0), tuple(0, 11)), // LEFT_TOP
  tuple(tuple(0, 28), tuple(0, 38)), // LEFT_BOTTOM
  tuple(tuple(0, 39), tuple(11, 39)), // BOTTOM_LEFT
  tuple(tuple(28, 39), tuple(38, 39)), // BOTTOM_RIGHT
  tuple(tuple(39, 39), tuple(39, 28)), // RIGHT_TOP
  tuple(tuple(39, 11), tuple(39, 1)), // RIGHT_BOTTOM
  tuple(tuple(39, 0), tuple(28, 0)), // TOP_RIGHT
  tuple(tuple(11, 0), tuple(1, 0)), // TOP_LEFT
];

const WALLS_CROSS = [
  tuple(tuple(19, 0), tuple(20, 39)), // TOP-BOTTOM
  tuple(tuple(0, 19), tuple(39, 20)), // LEFT-RIGHT
];

export const WALLS = [
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
    name: 'Corners',
    key: 'corners',
    value: WALLS_CORNERS,
  },
  {
    name: 'No',
    key: 'no',
    value: WALLS_NO,
  },
];
