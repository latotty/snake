import React from 'react';

import { GridCell } from './grid-cell';
import { getWallCells } from '../game/walls';

export const Wall = ({
  definition,
  cellSize,
}: {
  definition: [[number, number], [number, number]];
  cellSize: number;
}) => {
  return (
    <React.Fragment>
      {getWallCells([definition]).map(([x, y], i) => (
        <GridCell key={i} cellSize={cellSize} x={x} y={y} fill={'gray'} />
      ))}
    </React.Fragment>
  );
};
