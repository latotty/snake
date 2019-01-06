import React, { useState, useCallback, useMemo } from 'react';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS, getWallsByKey } from '../lib/walls';
import { ConfigPanel } from '../components/config-panel';
import { ViewSettingsPanel } from '../components/view-settings-panel';
import { useManualSnake } from '../lib/manual-snake.hook';
import { pushURL } from '../lib/next-router';
import { GithubRibbon } from '../components/github-ribbon';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

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
  const [viewSettings, setViewSettings] = useState({
    speed: BASE_SPEED,
    vision: false,
    viewSize: 31,
  });

  const { snakeState, loopTimeout } = useManualSnake(
    snakeConfig,
    viewSettings.speed,
    BASE_TIMEOUT,
  );

  const resetGame = useCallback(() => setSnakeConfig(c => ({ ...c })), [
    setSnakeConfig,
  ]);
  const onVisionChange = useCallback(
    newVision => {
      setViewSettings(settings => ({ ...settings, vision: newVision }));
    },
    [setViewSettings],
  );
  const onSpeedChange = useCallback(
    speed => setViewSettings(settings => ({ ...settings, speed })),
    [setViewSettings],
  );
  const onViewSizeChange = useCallback(
    viewSize => setViewSettings(settings => ({ ...settings, viewSize })),
    [setViewSettings],
  );

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

  const viewSettingsPanel = useMemo(
    () => (
      <ViewSettingsPanel
        speed={viewSettings.speed}
        loopTimeout={loopTimeout}
        onSpeedChange={onSpeedChange}
        vision={viewSettings.vision}
        onVisionChange={onVisionChange}
        baseTimeout={BASE_TIMEOUT}
        viewSize={viewSettings.viewSize}
        onViewSizeChange={onViewSizeChange}
      />
    ),
    [
      viewSettings.speed,
      loopTimeout,
      onSpeedChange,
      viewSettings.vision,
      onVisionChange,
      viewSettings.viewSize,
      onViewSizeChange,
    ],
  );

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
      <GithubRibbon />
      <div>
        <div style={inlineBlockStyle}>
          <SnakeView
            snakeConfig={snakeConfig}
            snakeState={snakeState}
            vision={viewSettings.vision}
            cellSize={20}
            scale={
              viewSettings.viewSize /
              Math.max(snakeConfig.boardWidth, snakeConfig.boardHeight)
            }
          />
        </div>
        <div style={inlineBlockStyle}>
          <div>{snakeState.gameOver ? 'Game Over (Press SPACE)' : ''}</div>
          <div>Score: {snakeState.snakeParts.length}</div>
          <div>
            <button onClick={resetGame}>Reset</button>
          </div>
          {viewSettingsPanel}
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
  const boardWidth = parseInt(query.width) || parseInt(query.size) || 31;
  const boardHeight = parseInt(query.height) || parseInt(query.size) || 31;

  return {
    seed,
    wallsKey: wallsDef ? wallsKey : WALLS[0].key,
    boardWidth,
    boardHeight,
  };
};

export default IndexPage;
