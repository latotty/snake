import React, { useState, useCallback, useMemo } from 'react';

import {
  SnakeConfig,
  createSnakeConfig,
  serializeSnakeConfig,
  deserializeSnakeConfig,
} from '../game/snake-config';
import { SnakeView } from '../components/snake-view';
import { ConfigPanel } from '../components/config-panel';
import { ViewSettingsPanel } from '../components/view-settings-panel';
import { useManualSnake } from '../lib/manual-snake.hook';
import { pushURL } from '../lib/next-router';
import { GithubRibbon } from '../components/github-ribbon';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const inlineBlockStyle = { display: 'inline-block' };

const IndexPage = ({ baseConfig }: { baseConfig: SnakeConfig | undefined }) => {
  const [snakeConfig, setSnakeConfig] = useState<SnakeConfig>(() =>
    createSnakeConfig(baseConfig || {}),
  );
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

  const onSnakeConfigChange = useCallback(
    configChanges =>
      setSnakeConfig(config => {
        const newConfig = createSnakeConfig({ ...config, ...configChanges });
        pushURL({ config: serializeSnakeConfig(newConfig) });
        return newConfig;
      }),
    [setSnakeConfig],
  );

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
      <ConfigPanel config={snakeConfig} onConfigChange={onSnakeConfigChange} />
    ),
    [snakeConfig, onSnakeConfigChange],
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

const parseConfigQuery = (config: string): SnakeConfig | undefined => {
  try {
    return deserializeSnakeConfig(config);
  } catch (err) {
    console.error('Failed to parse config query', err);
    return undefined;
  }
};

IndexPage.getInitialProps = ({
  query,
}: {
  query: { [key: string]: string };
}) => {
  const baseConfig = query.config && parseConfigQuery(query.config);

  return {
    baseConfig,
  };
};

export default IndexPage;
