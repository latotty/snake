import React from 'react';

import { GridCell } from './grid-cell';

export const Snake = ({
  parts,
  cellSize,
}: {
  parts: [number, number][];
  cellSize: number;
}) => (
  <React.Fragment>
    {parts.map(([x, y], i) => (
      <GridCell
        key={`snake_${i}`}
        cellSize={cellSize}
        x={x}
        y={y}
        fill={i === 0 ? 'lightgreen' : 'green'}
      />
    ))}
  </React.Fragment>
);
