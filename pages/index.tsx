import React, { useState, useCallback } from 'react';
import Router from 'next/router';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS } from '../lib/walls';
import { useManualSnake } from '../lib/manual-snake.hook';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

const getWallsByKey = (key: string) => WALLS.find(wall => wall.key === key);

const pushURL = (query: Partial<{ seed: string; walls: string }>) => {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, ...query },
  });
};

const IndexPage = ({
  wallsKey,
  seed,
  boardWidth,
  boardHeight,
}: {
  wallsKey: string;
  seed: string;
  boardWidth: number;
  boardHeight: number;
}) => {
  const wallsDef = getWallsByKey(wallsKey) || WALLS[0];
  const [snakeConfig, setSnakeConfig] = useState<snakeGame.Config>({
    boardWidth,
    boardHeight,
    initialSize: 3,
    foodValue: 0.1,
    walls: wallsDef.value(boardWidth, boardHeight),
    seed: seed,
  });
  const [speed, setSpeed] = useState(BASE_SPEED);
  const [vision, setVision] = useState<boolean>(false);

  const { snakeState, loopTimeout } = useManualSnake(
    snakeConfig,
    speed,
    BASE_TIMEOUT,
  );

  const changeSeed = (newSeed: string) => {
    pushURL({ seed: newSeed });
    setSnakeConfig(config => ({ ...config, seed: newSeed }));
  };

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
  const onSeedChange = useCallback(event => {
    event.persist();
    changeSeed(event.target.value);
  }, []);
  const randomizeSeed = useCallback(event => {
    event.persist();
    changeSeed(getRandomSeed());
  }, []);

  const onWallSelect = useCallback(event => {
    event.persist();
    const def = getWallsByKey(event.target.value);
    if (def) {
      pushURL({ walls: event.target.value });
      setSnakeConfig((config: snakeGame.Config) => ({
        ...config,
        walls: def.value(config.boardWidth, config.boardHeight),
      }));
    }
  }, []);

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
            <select value={wallsDef.key} onChange={onWallSelect}>
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
          <div>
            <label>
              Seed:{' '}
              <input
                type="text"
                value={snakeConfig.seed}
                onChange={onSeedChange}
              />
              <button onClick={randomizeSeed}>Random</button>
            </label>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

IndexPage.getInitialProps = ({
  query,
}: {
  query: { [key: string]: string };
}) => {
  const seed = query.seed || getRandomSeed();
  const wallsKey = query.walls || WALLS[0].key;
  const wallsDef = getWallsByKey(wallsKey);
  const boardWidth = parseInt(query.width) || 31;
  const boardHeight = parseInt(query.height) || 31;

  return {
    seed,
    wallsKey: wallsDef ? wallsKey : WALLS[0].key,
    boardWidth,
    boardHeight,
  };
};

export default IndexPage;
