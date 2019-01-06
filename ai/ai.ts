import * as snakeGame from '../game/snake';
import { coordRotate90, coordRotate270 } from '../lib/coord';

export enum Decision {
  None = 0,
  Left = 1,
  Right = 2,
}

export type AITick = (state: snakeGame.State) => Decision;

export const decisionToDirection = (
  direction: snakeGame.Direction,
  decision: Decision,
): snakeGame.Direction => {
  switch (decision) {
    case Decision.Left:
      return coordRotate270(direction);
    case Decision.Right:
      return coordRotate90(direction);
    default:
      return direction;
  }
};
