import React, { useState, useCallback } from 'react';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS } from '../lib/walls';
import { useManualSnake } from '../lib/manual-snake.hook';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

export default () => {
  const [snakeConfig, setSnakeConfig] = useState<snakeGame.Config>({
    boardWidth: 40,
    boardHeight: 40,
    initialSize: 3,
    foodValue: 0.1,
    walls: WALLS[0].value,
  });
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [vision, setVision] = useState<boolean>(false);

  const { snakeState, loopTimeout } = useManualSnake(
    snakeConfig,
    speed,
    BASE_TIMEOUT,
  );

  const resetGame = useCallback(() => setSnakeConfig(c => ({ ...c })), []);
  const increaseSpeed = useCallback(() => setSpeed(s => s + 1), []);
  const decreaseSpeed = useCallback(
    () => setSpeed(s => Math.max(1, s - 1)),
    [],
  );
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
          <div>
            <button onClick={resetGame}>Reset</button>
          </div>
          <div>
            Speed: {Math.round((BASE_TIMEOUT / loopTimeout) * 100)}
            <button onClick={increaseSpeed}>+</button>
            <button onClick={decreaseSpeed}>-</button>
          </div>
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
