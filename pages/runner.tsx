import React, { useState, useCallback, useMemo, useEffect } from 'react';

import * as snakeGame from '../game/snake';
import { SnakeView } from '../components/snake-view';
import { WALLS, getWallsByKey } from '../lib/walls';
import { ConfigPanel } from '../components/config-panel';
import { ViewSettingsPanel } from '../components/view-settings-panel';
import { pushURL } from '../lib/next-router';
import { AITick, decisionToDirection } from '../ai/ai';
import { randomAI, createRandomAIBrainFromName } from '../ai/random/random-ai';
import { GithubRibbon } from '../components/github-ribbon';

const BASE_TIMEOUT = 200;
const BASE_SPEED = 1;

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

const inlineBlockStyle = { display: 'inline-block' };

interface RunnerStepResult {
  currentStep: number;
  hasRunning: boolean;
  ais: { name: string; state: snakeGame.State; remainingSteps: number }[];
}
interface AiGame {
  gameTick: (
    state: snakeGame.State | undefined,
    newDirection?: snakeGame.Direction,
  ) => snakeGame.State;
  state: snakeGame.State;
  name: string;
  remainingSteps: number;
  aiTick: AITick;
}
const createRunner = (
  config: snakeGame.Config,
  ais: ({ name: string; tick: AITick })[],
  stepsPerLength: number,
) => {
  let aiGames: AiGame[] = ais.map(ai => {
    const gameTick = snakeGame.createGame(config);
    const state = gameTick(undefined);
    return {
      gameTick,
      state,
      name: ai.name,
      aiTick: ai.tick,
      remainingSteps: state.snakeParts.length * stepsPerLength,
    };
  });
  let currentStep = 0;
  return (): RunnerStepResult => {
    const hasRunning = aiGames.some(({ state: { gameOver } }) => !gameOver);
    if (hasRunning) {
      aiGames = aiGames.map(aiGame => {
        if (aiGame.state.gameOver) {
          return aiGame;
        }
        const maxSteps = aiGame.state.snakeParts.length * stepsPerLength;
        if (currentStep > maxSteps) {
          return {
            ...aiGame,
            state: {
              ...aiGame.state,
              gameOver: true,
            },
          };
        }
        const decision = aiGame.aiTick(aiGame.state);
        return {
          ...aiGame,
          remainingSteps: Math.max(0, maxSteps - currentStep),
          state: aiGame.gameTick(
            aiGame.gameTick(
              aiGame.state,
              decisionToDirection(aiGame.state.direction, decision),
            ),
          ),
        };
      });
      currentStep++;
    }
    return {
      currentStep,
      hasRunning: hasRunning,
      ais: aiGames.map(({ name, state, remainingSteps }) => ({
        name,
        state,
        remainingSteps,
      })),
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
  const [snakeConfig, setSnakeConfig] = useState<snakeGame.Config>(() =>
    snakeGame.createConfig({
      boardWidth,
      boardHeight,
      walls: wallsDef.value(boardWidth, boardHeight),
      seed: seed,
    }),
  );

  const [viewSettings, setViewSettings] = useState({
    speed: BASE_SPEED,
    vision: false,
    viewSize: 14,
  });
  const loopTimeout = useMemo(
    () => BASE_TIMEOUT * 0.5 ** (viewSettings.speed - 1),
    [viewSettings.speed],
  );

  const [aiBrains] = useState(() =>
    Array(8)
      .fill(null)
      .map(() => {
        const name = getRandomSeed();
        const brain = createRandomAIBrainFromName(name);
        const createTick = () =>
          randomAI({
            brain,
          });
        return { type: 'random', name, brain, createTick };
      }),
  );
  const stepsPerLength = 100;
  const [runner, setRunner] = useState(() =>
    createRunner(
      snakeConfig,
      aiBrains.map(({ name, createTick }) => ({
        name: name,
        tick: createTick(),
      })),
      stepsPerLength,
    ),
  );
  useEffect(
    () =>
      setRunner(() =>
        createRunner(
          snakeConfig,
          aiBrains.map(({ name, createTick }) => ({
            name: name,
            tick: createTick(),
          })),
          stepsPerLength,
        ),
      ),
    [snakeConfig, setRunner, aiBrains],
  ); // RESET EFFECT

  const [aisState, setAisState] = useState<RunnerStepResult>(() => ({
    hasRunning: true,
    currentStep: 0,
    ais: [],
  }));

  useEffect(
    () => {
      const tid = setInterval(() => {
        const result = runner();
        setAisState(result);
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

  const restartSimulationClick = useCallback(
    () => setSnakeConfig(config => ({ ...config })),
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
          <button onClick={restartSimulationClick}>Restart</button>
          {viewSettingsPanel}
          {configPanel}
          Current step: {aisState.currentStep}
        </div>
        <div>
          {aisState.ais.map(({ name, state, remainingSteps }, i) => (
            <div key={name} style={inlineBlockStyle}>
              <div>
                <div
                  title={
                    (aiBrains[i] && JSON.stringify(aiBrains[i].brain)) ||
                    'error'
                  }
                >
                  Name: {name}
                </div>
                <div>Score: {state.snakeParts.length}</div>
                <div>Remaining steps: {remainingSteps}</div>
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
