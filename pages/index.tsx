import React, { useState, useCallback, useMemo } from 'react';
import Router from 'next/router';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS, getWallsByKey } from '../lib/walls';
import { ConfigPanel } from '../components/config-panel';
import { useManualSnake } from '../lib/manual-snake.hook';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

const pushURL = (
  query: Partial<{
    seed: string;
    walls: string;
    size: number;
  }>,
) => {
  Router.push({
    pathname: Router.pathname,
    query: { ...Router.query, ...query },
  });
};

const inlineBlockStyle = { display: 'inline-block' };

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

  const onSeedChange = useCallback(newSeed => pushURL({ seed: newSeed }), []);
  const onWallsKeyChange = useCallback(
    wallsKey => pushURL({ walls: wallsKey }),
    [],
  );
  const onSnakeConfigChange = useCallback(
    configChanges =>
      setSnakeConfig(config => ({ ...config, ...configChanges })),
    [setSnakeConfig],
  );

  const onSizeChange = useCallback(size => pushURL({ size: size }), []);

  const configPanel = useMemo(
    () => (
      <ConfigPanel
        config={snakeConfig}
        onConfigChange={onSnakeConfigChange}
        onWallsKeyChange={onWallsKeyChange}
        onSeedChange={onSeedChange}
        onSizeChange={onSizeChange}
      />
    ),
    [
      snakeConfig,
      onSnakeConfigChange,
      onWallsKeyChange,
      onSeedChange,
      onSizeChange,
    ],
  );

  return (
    <React.Fragment>
      <style jsx global>{`
        body {
          margin: 0;
        }
      `}</style>
      <div>
        <div style={inlineBlockStyle}>
          <SnakeView
            snakeConfig={snakeConfig}
            snakeState={snakeState}
            vision={vision}
            cellSize={20}
            scale={
              31 / Math.max(snakeConfig.boardWidth, snakeConfig.boardHeight)
            }
          />
        </div>
        <div style={inlineBlockStyle}>
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
            <label>
              Vision:{' '}
              <input
                checked={vision}
                type="checkbox"
                onChange={onVisionChange}
              />
            </label>
          </div>
          {configPanel}
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
  const boardWidth = parseInt(query.width) || query.size || 31;
  const boardHeight = parseInt(query.height) || query.size || 31;

  return {
    seed,
    wallsKey: wallsDef ? wallsKey : WALLS[0].key,
    boardWidth,
    boardHeight,
  };
};

export default IndexPage;
