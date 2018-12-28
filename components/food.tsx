import React from 'react';
import { GridCell } from './grid-cell';

export const Food = (props: { x: number; y: number; cellSize: number }) => (
  <GridCell cellSize={props.cellSize} x={props.x} y={props.y} fill="red" />
);
