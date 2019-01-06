import * as snakeGame from '../game/snake';
import { SnakeConfig } from '../game/snake-config';
import { getWallCells } from '../lib/wall-cells';
import { Coord, coordCollide } from './coord';
import { getDirections } from './directions';

/**
 * [...[food, tails, walls]]
 */
export const getVision = (
  config: SnakeConfig,
  visionDistance: number,
): ((snakeParts: Coord[], forward: Coord, food: Coord) => number[]) => {
  const wallCells = getWallCells(config.walls);

  return (snakeParts: Coord[], forward: Coord, food: Coord): number[] => {
    const directions = getDirections(forward);
    const snakeHead = snakeParts[0];

    return directions
      .map(direction => {
        let foodDistance = 0;
        let tailDistance = 0;
        let wallDistance = 0;
        let currentCell = snakeHead;
        let currentDistance = 0;

        do {
          currentDistance++;
          currentCell = snakeGame.moveOnBoard(config, currentCell, direction);

          if (!foodDistance && coordCollide(currentCell, [food])) {
            foodDistance = currentDistance;
            continue;
          }
          if (!tailDistance && coordCollide(currentCell, snakeParts)) {
            tailDistance = currentDistance;
            continue;
          }
          if (!wallDistance && coordCollide(currentCell, wallCells)) {
            wallDistance = currentDistance;
            continue;
          }
        } while (
          (!foodDistance || !tailDistance || !wallDistance) &&
          currentDistance < visionDistance
        );

        return [foodDistance, tailDistance, wallDistance];
      })
      .reduce((acc, curr) => [...acc, ...curr], []);
  };
};
