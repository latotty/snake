import React, { useState, useEffect, useCallback, useMemo } from 'react';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS } from '../lib/walls';
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
  setSpeed: (speed: number) => void,
): { startListen: Function; stopListen: Function } => {
  const keydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case ' ':
        setSnakeState(() => gameTick(undefined));
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

    const num = parseInt(event.key);
    if (!Number.isNaN(num) && num >= 1) {
      setSpeed(num);
      return event.preventDefault();
    }
  };

  return {
    startListen: () => window.addEventListener('keydown', keydown),
    stopListen: () => window.removeEventListener('keydown', keydown),
  };
};

const BASE_SPEED = 1;
const BASE_TIMEOUT = 200;

const snakeHook = (
  config: snakeGame.Config,
): {
  snakeState: snakeGame.State;
  loopTimeout: number;
} => {
  const [speed, setSpeed] = useState(BASE_SPEED);
  const gameTick = useMemo(() => snakeGame.createGame(config), [config]);
  const [snakeState, setSnakeState] = useState(() => gameTick(undefined));
  useEffect(() => setSnakeState(gameTick(undefined)), [config]); // RESET EFFECT
  const loopTimeout =
    BASE_TIMEOUT *
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
        setSpeed,
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

export default () => {
  const [snakeConfig, setSnakeConfig] = useState<snakeGame.Config>({
    boardWidth: 40,
    boardHeight: 40,
    initialSize: 3,
    foodValue: 0.1,
    walls: WALLS[0].value,
  });
  const { snakeState, loopTimeout } = snakeHook(snakeConfig);
  const [vision, setVision] = useState<boolean>(false);
  const onVisionChange = useCallback(event => {
    event.persist();
    setVision(event.target.checked);
  }, []);

  const onWallSelect = useCallback(event => {
    event.persist();
    const def = WALLS.find(wall => wall.key === event.target.value);
    if (def) {
      setSnakeConfig((config: snakeGame.Config) => ({
        ...config,
        walls: def.value,
      }));
    }
  }, []);
  const wallKey = (
    WALLS.find(wall => wall.value === snakeConfig.walls) || { key: 'unknown' }
  ).key;

  return (
    <React.Fragment>
      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
      <div>
        <div style={{ maxWidth: 700 }}>
          <SnakeView
            snakeConfig={snakeConfig}
            snakeState={snakeState}
            vision={vision}
          />
        </div>
        <div style={{ display: 'inline-block' }}>
          <div>{snakeState.gameOver ? 'Game Over (Press SPACE)' : ''}</div>
          <div>Score: {snakeState.snakeParts.length}</div>
          <div>Speed: {Math.round((BASE_TIMEOUT / loopTimeout) * 100)}</div>
          <div>
            Wall layout:
            <select value={wallKey} onChange={onWallSelect}>
              {WALLS.map(({ name, key }) => (
                <option key={key} value={key}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>
              Vision:{' '}
              <input
                checked={vision}
                type="checkbox"
                onChange={onVisionChange}
              />
            </label>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
