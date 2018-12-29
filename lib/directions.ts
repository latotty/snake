import {
  Coord,
  coordAdd,
  coordRotate90,
  coordRotate180,
  coordRotate270,
} from './coord';

export const getDirections = (forward: Coord): Coord[] => {
  const right = coordRotate90(forward);
  const back = coordRotate180(forward);
  const left = coordRotate270(forward);

  const forwardRight = coordAdd(forward, right);
  const backRight = coordAdd(back, right);
  const backLeft = coordAdd(back, left);
  const forwardLeft = coordAdd(forward, left);

  return [
    forward,
    forwardRight,
    right,
    backRight,
    back,
    backLeft,
    left,
    forwardLeft,
  ];
};
