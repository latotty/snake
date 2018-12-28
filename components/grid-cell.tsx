import React from 'react';
import { Rect } from 'react-konva';

export const GridCell = ({
  x,
  y,
  cellSize,
  fill,
}: {
  x: number;
  y: number;
  cellSize: number;
  fill: string;
}) => (
  <Rect
    width={cellSize - 3}
    height={cellSize - 3}
    x={x * cellSize + 1}
    y={y * cellSize + 1}
    strokeWidth={0}
    strokeEnabled={false}
    shadowEnabled={false}
    fill={fill}
  />
);
