import React, { useState, useMemo } from 'react';
import Measure from 'react-measure';
import { Stage, Layer } from 'react-konva';

import { windowSizeHook } from '../lib/window-size.hook';
import * as snakeGame from '../game/snake';
import { GridLayer } from './grid-layer';
import { Snake } from './snake';
import { Food } from './food';
import { Wall } from './wall';
import { SnakeVision } from './snake-vision';

const getScale = (
  stageWidth: number,
  stageHeight: number,
  windowWidth: number,
  windowHeight: number,
): number => {
  const xScale = windowWidth / stageWidth;
  const yScale = windowHeight / stageHeight;
  return Math.min(xScale, yScale);
};

export const SnakeView = ({
  snakeConfig,
  snakeState,
  vision,
}: {
  snakeConfig: snakeGame.Config;
  snakeState: snakeGame.State;
  vision: boolean;
}) => {
  const cellSize = 20;
  const stageWith = snakeConfig.boardWidth * cellSize;
  const stageHeight = snakeConfig.boardHeight * cellSize;

  const [size, setSize] = useState([800, 800]);
  const windowSize = windowSizeHook();
  const stageSize = Math.min(size[0], windowSize[1] * 0.8);

  const margin = 10;
  const border = 2;
  const containerSize = stageSize - margin * 2 - border * 2;
  const scale = getScale(stageWith, stageHeight, containerSize, containerSize);

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

  return (
    <Measure
      bounds
      onResize={(contentRect: any) => {
        setSize([contentRect.bounds.width, contentRect.bounds.height]);
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef} style={{ width: '100%', height: '100%' }}>
          <div
            style={{
              backgroundColor: 'black',
              margin: margin,
              borderStyle: 'solid',
              borderColor: 'black',
              borderWidth: border,
              display: 'inline-block',
            }}
          >
            <Stage
              width={containerSize}
              height={containerSize}
              scaleX={scale}
              scaleY={scale}
            >
              {gridLayer}
              {gameLayer}
              {wallLayer}
              {visionLayer}
            </Stage>
          </div>
        </div>
      )}
    </Measure>
  );
};
