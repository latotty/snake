import React, { useCallback } from 'react';

export const ViewSettingsPanel = ({
  baseTimeout,
  loopTimeout,
  speed,
  onSpeedChange,
  vision,
  onVisionChange,
  viewSize,
  onViewSizeChange,
}: {
  baseTimeout: number;
  loopTimeout: number;
  speed: number;
  onSpeedChange: (speed: number) => void;
  vision: boolean;
  onVisionChange: (vision: boolean) => void;
  viewSize: number;
  onViewSizeChange: (viewSize: number) => void;
}) => {
  const increaseSpeed = useCallback(() => onSpeedChange(speed + 1), [
    onSpeedChange,
    speed,
  ]);
  const decreaseSpeed = useCallback(
    () => onSpeedChange(Math.max(1, speed - 1)),
    [onSpeedChange, speed],
  );

  const increaseViewSize = useCallback(() => onViewSizeChange(viewSize + 1), [
    onViewSizeChange,
    viewSize,
  ]);
  const decreaseViewSize = useCallback(
    () => onViewSizeChange(Math.max(1, viewSize - 1)),
    [onViewSizeChange, viewSize],
  );

  const onVisionInputChange = useCallback(
    event => {
      event.persist();
      onVisionChange(event.target.checked);
    },
    [onVisionChange],
  );

  return (
    <React.Fragment>
      <div>
        Speed: {Math.round((baseTimeout / loopTimeout) * 100)}
        <button onClick={increaseSpeed}>+</button>
        <button onClick={decreaseSpeed}>-</button>
      </div>
      <div>
        <label>
          Vision:{' '}
          <input
            checked={vision}
            type="checkbox"
            onChange={onVisionInputChange}
          />
        </label>
      </div>
      <div>
        View size: {viewSize}
        <button onClick={increaseViewSize}>+</button>
        <button onClick={decreaseViewSize}>-</button>
      </div>
    </React.Fragment>
  );
};
