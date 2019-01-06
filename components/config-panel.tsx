import React, { useMemo, useCallback } from 'react';

import { SnakeConfig } from '../game/snake-config';
import { WALLS, getWallsByKey, getWallsDefByWalls } from '../lib/walls';

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

export const ConfigPanel = ({
  config,
  onConfigChange,
}: {
  config: SnakeConfig;
  onConfigChange: (config: Partial<SnakeConfig>) => void;
}) => {
  const wallsKey = useMemo(
    () => {
      const def = getWallsDefByWalls(
        config.walls,
        config.boardWidth,
        config.boardHeight,
      );
      return def ? def.key : 'custom';
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
      }
    },
    [onConfigChange, config.boardWidth, config.boardHeight],
  );

  const onSeedInputChange = useCallback(
    event => {
      event.persist();
      const newSeed = event.target.value;
      onConfigChange({
        seed: newSeed,
      });
    },
    [onConfigChange],
  );

  const randomizeSeed = useCallback(
    event => {
      event.persist();
      const newSeed = getRandomSeed();
      onConfigChange({
        seed: newSeed,
      });
    },
    [onConfigChange],
  );

  const onSizeInputChange = useCallback(
    event => {
      event.persist();
      const newSize = parseInt(event.target.value);
      const wallsDef = getWallsByKey(wallsKey);
      if (newSize > 0 && (wallsDef || wallsKey === 'custom')) {
        onConfigChange({
          ...(wallsDef && { walls: wallsDef.value(newSize, newSize) }),
          boardWidth: newSize,
          boardHeight: newSize,
        });
      }
    },
    [onConfigChange, wallsKey],
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
          {wallsKey === 'custom' && (
            <option key="custom" value="custom">
              Custom
            </option>
          )}
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
