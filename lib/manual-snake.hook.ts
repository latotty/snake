import { useState, useEffect } from 'react';

import * as snakeGame from '../game/snake';
import { coordEq } from '../lib/coord';

const snakeLoop = (
  gameTick: (
    state: snakeGame.State | undefined,
    newDirection?: snakeGame.Direction,
  ) => snakeGame.State,
  timeout: number,
  setSnakeState: ((cb: (state: snakeGame.State) => snakeGame.State) => void),
): { startLoop: Function; resetLoop: Function; stopLoop: Function } => {
  let tid: number;
  let stop = false;
  const loop = () => {
    if (stop) {
      return;
    }
    setSnakeState(state => gameTick(state));
    resetLoop();
  };

  const resetLoop = () => {
    window.clearTimeout(tid);
    tid = window.setTimeout(loop, timeout);
  };

  return {
    resetLoop,
    startLoop: () => resetLoop(),
    stopLoop: () => {
      stop = true;
      window.clearTimeout(tid);
    },
  };
};

const keyMap: { [key: string]: snakeGame.Direction } = {
  ArrowUp: snakeGame.Directions.Up,
  ArrowRight: snakeGame.Directions.Right,
  ArrowDown: snakeGame.Directions.Down,
  ArrowLeft: snakeGame.Directions.Left,

  w: snakeGame.Directions.Up,
  d: snakeGame.Directions.Right,
  s: snakeGame.Directions.Down,
  a: snakeGame.Directions.Left,
};

const keyListener = (
  config: snakeGame.Config,
  gameTick: (
    state: snakeGame.State | undefined,
    newDirection?: snakeGame.Direction,
  ) => snakeGame.State,
  setSnakeState: ((cb: (state: snakeGame.State) => snakeGame.State) => void),
  resetLoop: Function,
  resetGame: Function,
): { startListen: Function; stopListen: Function } => {
  const keydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case ' ':
        resetGame();
        return event.preventDefault();
    }

    if (event.key in keyMap) {
      const direction = keyMap[event.key];
      setSnakeState(state => {
        if (
          (state.snakeParts.length > 2 &&
            coordEq(
              snakeGame.moveOnBoard(config, state.snakeParts[0], direction),
              state.snakeParts[1],
            )) ||
          coordEq(state.direction, direction)
        ) {
          return state;
        }
        resetLoop();
        return gameTick(gameTick(state, direction));
      });
      return event.preventDefault();
    }
  };

  return {
    startListen: () => window.addEventListener('keydown', keydown),
    stopListen: () => window.removeEventListener('keydown', keydown),
  };
};

export const useManualSnake = (
  config: snakeGame.Config,
  speed: number,
  baseTimeout: number,
): {
  snakeState: snakeGame.State;
  loopTimeout: number;
} => {
  const [gameTick, setGameTick] = useState(() => snakeGame.createGame(config));
  const [snakeState, setSnakeState] = useState(() => gameTick(undefined));
  const resetGame = () => {
    const newGameTick = snakeGame.createGame(config);
    const newState = newGameTick(undefined);
    setGameTick(() => newGameTick);
    setSnakeState(() => newState);
  };
  useEffect(() => resetGame(), [config]); // RESET EFFECT

  const loopTimeout =
    baseTimeout *
    Math.min(1, 0.99 ** (snakeState.snakeParts.length / 8)) *
    0.5 ** (speed - 1);

  useEffect(
    () => {
      const { resetLoop, startLoop, stopLoop } = snakeLoop(
        gameTick,
        loopTimeout,
        setSnakeState,
      );

      const { startListen, stopListen } = keyListener(
        config,
        gameTick,
        setSnakeState,
        resetLoop,
        resetGame,
      );
      startLoop();
      startListen();
      return () => {
        stopLoop();
        stopListen();
      };
    },
    [config, loopTimeout],
  );

  return { snakeState, loopTimeout };
};
