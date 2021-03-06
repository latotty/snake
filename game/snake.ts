import { alea } from 'seedrandom';

import { tuple, Coord, coordEq, coordCollide, coordAdd } from '../lib/coord';
import { getWallCells } from './walls';
import { SnakeConfig } from './snake-config';

export type Direction = Coord;
export const Directions = {
  Up: [0, -1] as Direction,
  Right: [1, 0] as Direction,
  Down: [0, 1] as Direction,

  Left: [-1, 0] as Direction,
};

export interface State {
  snakeParts: Coord[];
  direction: Direction;
  growth: number;
  food: Coord;
  gameOver: boolean;
}

// better random gen, when the board is full TODO
const randomCoord = (
  config: SnakeConfig,
  ignoredCoords: Coord[],
  rng: () => number,
): Coord | null => {
  if (freeCellCount(config, ignoredCoords) < 1) {
    return null;
  }
  const freeCells = Array(config.boardWidth * config.boardHeight)
    .fill(null)
    .map((_, i) =>
      tuple(Math.floor(i / config.boardHeight), i % config.boardHeight),
    )
    .filter(coord => !coordCollide(coord, ignoredCoords));

  return freeCells[Math.floor(rng() * freeCells.length)];
};

const freeCellCount = (config: SnakeConfig, ignoredCoords: Coord[]): number => {
  const cellCount = config.boardWidth * config.boardHeight;
  const freeCellCount = cellCount - ignoredCoords.length;
  return freeCellCount;
};

const normalizeCoords = (config: SnakeConfig, [x, y]: Coord): Coord => {
  if (x < 0) {
    return normalizeCoords(config, [config.boardWidth + x, y]);
  }
  if (x >= config.boardWidth) {
    return normalizeCoords(config, [x - config.boardWidth, y]);
  }
  if (y < 0) {
    return normalizeCoords(config, [x, config.boardHeight + y]);
  }
  if (y >= config.boardHeight) {
    return normalizeCoords(config, [x, y - config.boardHeight]);
  }
  return [x, y];
};

export const moveOnBoard = (
  config: SnakeConfig,
  coord: Coord,
  direction: Direction,
): Coord => {
  return normalizeCoords(config, coordAdd(coord, direction));
};

const getRandomDirection = (rng: () => number) =>
  [Directions.Up, Directions.Right, Directions.Down, Directions.Left][
    Math.floor(rng() * 4)
  ];

export function createGame(
  config: SnakeConfig,
): (state: State | undefined, newDirection?: Direction) => State {
  const wallCells = getWallCells(config.walls);
  const rng = alea(config.seed);

  const tick = (state: State | undefined, newDirection?: Direction): State => {
    if (!state) {
      const direction = getRandomDirection(rng);
      const snakeHead = randomCoord(config, wallCells, rng)!;
      const food = randomCoord(config, [snakeHead, ...wallCells], rng)!;
      if (!food || !snakeHead) {
        throw new Error('invalid map');
      }
      return {
        food,
        direction,
        snakeParts: [snakeHead],
        growth: config.initialSize - 1,
        gameOver: false,
      };
    }

    if (newDirection) {
      return {
        ...state,
        direction: [newDirection[0], newDirection[1]],
      };
    }

    if (state.gameOver) {
      return state;
    }

    const snakeHead = state.snakeParts[0];
    const nextCell = moveOnBoard(config, snakeHead, state.direction);

    const nextTickBody =
      state.growth >= 1 ? state.snakeParts : state.snakeParts.slice(0, -1);

    if (coordEq(nextCell, state.food)) {
      // ate apple
      const snakeParts = [nextCell, ...nextTickBody];
      const food = randomCoord(config, [...snakeParts, ...wallCells], rng);
      if (!food) {
        // full table so WINNING
        return {
          ...state,
          gameOver: true,
        };
      }
      return {
        ...state,
        growth:
          state.growth +
          Math.max(
            config.foodMin,
            config.foodMult
              ? state.snakeParts.length * config.foodValue
              : config.foodValue,
          ),
        snakeParts,
        food,
      };
    }

    if (coordCollide(nextCell, [...nextTickBody, ...wallCells])) {
      // hit tail or wall
      return {
        ...state,
        gameOver: true,
      };
    }

    return {
      ...state,
      growth: state.growth >= 1 ? Math.max(0, state.growth - 1) : state.growth,
      snakeParts: [nextCell, ...nextTickBody],
    };
  };

  return tick;
}
