import React, { useState, useCallback, useMemo, useEffect } from 'react';

import * as snakeGame from '../game/snake';
import {
  SnakeConfig,
  createSnakeConfig,
  serializeSnakeConfig,
  deserializeSnakeConfig,
} from '../game/snake-config';
import { SnakeView } from '../components/snake-view';
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
  config: SnakeConfig,
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
  baseConfig,
}: {
  baseConfig: SnakeConfig | undefined;
}) => {
  const [snakeConfig, setSnakeConfig] = useState<SnakeConfig>(() =>
    createSnakeConfig(baseConfig || {}),
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

  const onSnakeConfigChange = useCallback(
    configChanges =>
      setSnakeConfig(config => {
        const newConfig = createSnakeConfig({ ...config, ...configChanges });
        pushURL({ config: serializeSnakeConfig(newConfig) });
        return newConfig;
      }),
    [setSnakeConfig],
  );

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

const parseConfigQuery = (config: string): SnakeConfig | undefined => {
  try {
    return deserializeSnakeConfig(config);
  } catch (err) {
    console.error('Failed to parse config query', err);
    return undefined;
  }
};

RunnerPage.getInitialProps = ({
  query,
}: {
  query: { [key: string]: string };
}) => {
  const baseConfig = query.config && parseConfigQuery(query.config);

  return {
    baseConfig,
  };
};

export default RunnerPage;
