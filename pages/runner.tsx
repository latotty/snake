import React, { useState, useCallback, useMemo, useEffect } from 'react';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS, getWallsByKey } from '../lib/walls';
import { ConfigPanel } from '../components/config-panel';
import { ViewSettingsPanel } from '../components/view-settings-panel';
import { pushURL } from '../lib/next-router';
import { AITick, decisionToDirection } from '../ai/ai';
import { randomAI } from '../ai/random/random-ai';
import { GithubRibbon } from '../components/github-ribbon';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

const inlineBlockStyle = { display: 'inline-block' };

interface AiGame {
  gameTick: (
    state: snakeGame.State | undefined,
    newDirection?: snakeGame.Direction,
  ) => snakeGame.State;
  state: snakeGame.State;
  name: string;
  aiTick: AITick;
}
const createRunner = (
  config: snakeGame.Config,
  ais: ({ name: string; tick: AITick })[],
) => {
  let aiGames: AiGame[] = ais.map(ai => {
    const gameTick = snakeGame.createGame(config);
    const state = gameTick(undefined);
    return {
      gameTick,
      state,
      name: ai.name,
      aiTick: ai.tick,
    };
  });
  return (): {
    hasRunning: boolean;
    ais: { name: string; state: snakeGame.State }[];
  } => {
    const hasRunning = aiGames.some(({ state: { gameOver } }) => !gameOver);
    if (hasRunning) {
      aiGames = aiGames.map(aiGame => {
        if (aiGame.state.gameOver) {
          return aiGame;
        }
        const decision = aiGame.aiTick(aiGame.state);
        return {
          ...aiGame,
          state: aiGame.gameTick(
            aiGame.gameTick(
              aiGame.state,
              decisionToDirection(aiGame.state.direction, decision),
            ),
          ),
        };
      });
    }
    return {
      hasRunning: hasRunning,
      ais: aiGames.map(({ name, state }) => ({ name, state })),
    };
  };
};

const RunnerPage = ({
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
    viewSize: 14,
  });
  const loopTimeout = useMemo(
    () => BASE_TIMEOUT * 0.5 ** (viewSettings.speed - 1),
    [viewSettings.speed],
  );

  const [aisNames] = useState(() =>
    Array(8)
      .fill(null)
      .map(() => getRandomSeed()),
  );

  const [runner, setRunner] = useState(() =>
    createRunner(
      snakeConfig,
      aisNames.map(name => ({
        name: name,
        tick: randomAI({
          brain: {
            seed: name,
          },
        }),
      })),
    ),
  );
  useEffect(
    () =>
      setRunner(() =>
        createRunner(
          snakeConfig,
          aisNames.map(name => ({
            name: name,
            tick: randomAI({
              brain: {
                seed: name,
              },
            }),
          })),
        ),
      ),
    [snakeConfig, setRunner, aisNames],
  ); // RESET EFFECT

  const [aisState, setAisState] = useState<
    {
      state: snakeGame.State;
      name: string;
    }[]
  >(() => []);

  useEffect(
    () => {
      const tid = setInterval(() => {
        const result = runner();
        setAisState(result.ais);
      }, loopTimeout);
      return () => clearInterval(tid);
    },
    [loopTimeout, runner, setAisState],
  );

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
        <div>
          {viewSettingsPanel}
          {configPanel}
        </div>
        {aisState.map(({ name, state }) => (
          <div key={name} style={inlineBlockStyle}>
            <div>
              <div>Name: {name}</div>
              <div>Score: {state.snakeParts.length}</div>
            </div>
            <SnakeView
              snakeConfig={snakeConfig}
              snakeState={state}
              cellSize={20}
              vision={viewSettings.vision}
              scale={
                viewSettings.viewSize /
                Math.max(snakeConfig.boardWidth, snakeConfig.boardHeight)
              }
            />
          </div>
        ))}
      </div>
    </React.Fragment>
  );
};

RunnerPage.getInitialProps = ({
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

export default RunnerPage;
