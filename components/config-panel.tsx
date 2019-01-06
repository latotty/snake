import React, { useMemo, useCallback } from 'react';

import * as snakeGame from '../game/snake';
import { WALLS, getWallsByKey } from '../lib/walls';

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

export const ConfigPanel = ({
  config,
  onConfigChange,
  onSeedChange,
  onWallsKeyChange,
  onSizeChange,
}: {
  config: snakeGame.Config;
  onConfigChange: (config: Partial<snakeGame.Config>) => void;
  onSeedChange: (seed: string) => void;
  onWallsKeyChange: (wallsKey: string) => void;
  onSizeChange: (size: number) => void;
}) => {
  const wallsKey = useMemo(
    () => {
      const configWallsJSON = JSON.stringify(config.walls);
      const def = WALLS.find(wallsDef => {
        const walls = wallsDef.value(config.boardWidth, config.boardHeight);
        return (
          walls.length === config.walls.length &&
          JSON.stringify(walls) === configWallsJSON
        );
      });
      return def ? def.key : '';
    },
    [config.walls],
  );

  const onWallSelect = useCallback(
    event => {
      event.persist();
      const def = getWallsByKey(event.target.value);
      if (def) {
        onConfigChange({
          walls: def.value(config.boardWidth, config.boardHeight),
        });
        onWallsKeyChange && onWallsKeyChange(def.key);
      }
    },
    [onConfigChange, onWallsKeyChange, config.boardWidth, config.boardHeight],
  );

  const onSeedInputChange = useCallback(
    event => {
      event.persist();
      const newSeed = event.target.value;
      onConfigChange({
        seed: newSeed,
      });
      onSeedChange && onSeedChange(newSeed);
    },
    [onConfigChange, onSeedChange],
  );

  const randomizeSeed = useCallback(
    event => {
      event.persist();
      const newSeed = getRandomSeed();
      onConfigChange({
        seed: newSeed,
      });
      onSeedChange && onSeedChange(newSeed);
    },
    [onConfigChange, onSeedChange],
  );

  const onSizeInputChange = useCallback(
    event => {
      event.persist();
      const newSize = parseInt(event.target.value);
      const wallsDef = getWallsByKey(wallsKey);
      if (newSize > 0 && wallsDef) {
        const walls = wallsDef.value(newSize, newSize);
        onConfigChange({
          walls,
          boardWidth: newSize,
          boardHeight: newSize,
        });
        onSizeChange && onSizeChange(newSize);
      }
    },
    [onConfigChange, onSizeChange, wallsKey],
  );

  return (
    <React.Fragment>
      <div>
        Wall layout:
        <select value={wallsKey} onChange={onWallSelect}>
          {WALLS.map(({ name, key }) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>
          Seed:{' '}
          <input type="text" value={config.seed} onChange={onSeedInputChange} />
          <button onClick={randomizeSeed}>Random</button>
        </label>
      </div>
      <div>
        <label>
          Size:{' '}
          <input
            type="number"
            value={Math.min(config.boardWidth, config.boardHeight)}
            onChange={onSizeInputChange}
          />
        </label>
      </div>
    </React.Fragment>
  );
};
