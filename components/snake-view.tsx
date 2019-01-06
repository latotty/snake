import React, { useMemo } from 'react';
import { Stage, Layer, Text } from 'react-konva';

import * as snakeGame from '../game/snake';
import { GridLayer } from './grid-layer';
import { Snake } from './snake';
import { Food } from './food';
import { Wall } from './wall';
import { SnakeVision } from './snake-vision';

const stageContainerStyle = {
  backgroundColor: 'black',
  margin: 10,
  borderStyle: 'solid',
  borderColor: 'black',
  borderWidth: 2,
  display: 'inline-block',
};

export const SnakeView = ({
  snakeConfig,
  snakeState,
  vision,
  cellSize,
  scale = 1,
}: {
  snakeConfig: snakeGame.Config;
  snakeState: snakeGame.State;
  vision: boolean;
  cellSize: number;
  scale: number;
}) => {
  const stageWith = snakeConfig.boardWidth * cellSize;
  const stageHeight = snakeConfig.boardHeight * cellSize;

  const gridLayer = useMemo(
    () => (
      <GridLayer width={stageWith} height={stageHeight} cellSize={cellSize} />
    ),
    [snakeConfig, cellSize],
  );

  const wallLayer = useMemo(
    () => (
      <Layer>
        {snakeConfig.walls.map((wall, i) => (
          <Wall key={`walls_${i}`} definition={wall} cellSize={cellSize} />
        ))}
      </Layer>
    ),
    [snakeConfig, cellSize],
  );

  const gameLayer = useMemo(
    () => (
      <Layer>
        <Snake cellSize={cellSize} parts={snakeState.snakeParts} />
        <Food
          cellSize={cellSize}
          x={snakeState.food[0]}
          y={snakeState.food[1]}
        />
      </Layer>
    ),
    [cellSize, snakeState],
  );

  const visionLayer = useMemo(
    () =>
      vision && (
        <Layer>
          <SnakeVision
            config={snakeConfig}
            cellSize={cellSize}
            snakeParts={snakeState.snakeParts}
            forward={snakeState.direction}
            food={snakeState.food}
          />
        </Layer>
      ),
    [vision, cellSize, snakeConfig, snakeState],
  );

  const gameOverLayer = useMemo(
    () =>
      snakeState.gameOver && (
        <Layer>
          <Text
            text="Game Over"
            align="center"
            verticalAlign="middle"
            fill="white"
            fontSize={30}
            scaleX={1 / scale}
            scaleY={1 / scale}
            width={stageWith * scale}
            height={stageHeight * scale}
          />
        </Layer>
      ),
    [snakeState.gameOver],
  );

  return (
    <div style={stageContainerStyle}>
      <Stage
        width={stageWith * scale}
        height={stageHeight * scale}
        scaleX={scale}
        scaleY={scale}
      >
        {gridLayer}
        {gameLayer}
        {wallLayer}
        {visionLayer}
        {gameOverLayer}
      </Stage>
    </div>
  );
};
