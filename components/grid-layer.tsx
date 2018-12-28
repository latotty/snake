import React from 'react';
import { Layer, Line } from 'react-konva';

export const GridLayer = ({
  width,
  height,
  cellSize,
}: {
  width: number;
  height: number;
  cellSize: number;
}) => (
  <Layer>
    {Array(Math.round(width / cellSize))
      .fill(null)
      .map((_, i) => (
        <Line
          key={`cell_y_${i}`}
          stroke="#111"
          strokeWidth={0.5}
          points={[
            Math.round(i * cellSize) - 0.5,
            0,
            Math.round(i * cellSize) - 0.5,
            height,
          ]}
        />
      ))}
    {Array(Math.round(height / cellSize))
      .fill(null)
      .map((_, i) => (
        <Line
          key={`cell_x_${i}`}
          stroke="#111"
          strokeWidth={0.5}
          points={[
            0,
            Math.round(i * cellSize) - 0.5,
            width,
            Math.round(i * cellSize) - 0.5,
          ]}
        />
      ))}
  </Layer>
);
