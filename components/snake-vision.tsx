import React from 'react';
import { Line } from 'react-konva';

import * as snakeGame from '../game/snake';
import { SnakeConfig } from '../game/snake-config';
import { getVision } from '../lib/snake-vision';
import { Coord, coordMult, coordAdd } from '../lib/coord';
import { getDirections } from '../lib/directions';

const cellCenter = (coord: Coord, cellSize: number): [number, number] =>
  coordAdd(coordMult(coord, [cellSize, cellSize]), [
    cellSize / 2,
    cellSize / 2,
  ]);

export const SnakeVision = ({
  config,
  cellSize,
  snakeParts,
  forward,
  food,
}: {
  config: SnakeConfig;
  cellSize: number;
  snakeParts: Coord[];
  forward: Coord;
  food: Coord;
}) => {
  const vision = getVision(config, 20)(snakeParts, forward, food);
  const directions = getDirections(forward);
  const snakeHead = snakeParts[0];
  return (
    <React.Fragment>
      {vision.map((distance, i) => {
        if (!distance) {
          return;
        }
        const direction = directions[Math.floor(i / 3)];
        const stroke = ['red', 'green', 'grey'][i % 3];
        const strokeWidth = 4 - (i % 3);
        return (
          <React.Fragment key={i}>
            {Array(distance)
              .fill(null)
              .map((_, d) => {
                const startCell =
                  d === 0
                    ? snakeHead
                    : snakeGame.moveOnBoard(
                        config,
                        snakeHead,
                        coordMult(direction, [d, d]),
                      );
                const endCell = snakeGame.moveOnBoard(
                  config,
                  snakeHead,
                  coordMult(direction, [d + 1, d + 1]),
                );
                if (
                  Math.abs(startCell[0] - endCell[0]) > 1 ||
                  Math.abs(startCell[1] - endCell[1]) > 1
                ) {
                  return;
                }
                const start = cellCenter(startCell, cellSize);
                const end = cellCenter(endCell, cellSize);
                return (
                  <Line
                    key={d}
                    points={[...start, ...end]}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    fillEnabled={false}
                    opacity={0.5}
                  />
                );
              })}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};
