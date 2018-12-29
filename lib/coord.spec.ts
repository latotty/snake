import {
  Coord,
  tuple,
  coordAdd,
  coordMult,
  coordEq,
  coordCollide,
  coordRotate90,
  coordRotate270,
  coordRotate180,
  coordSortAndUniq,
} from './coord';

describe('tuple', () => {
  test('should be initial', () => {
    const coord = [1, 2];
    expect(tuple(...coord)).toEqual(coord);
  });
});

describe('coordAdd', () => {
  test('should add', () => {
    const coord1 = [2, 3];
    const coord2 = [4, 5];
    const coord3 = [6, 8];
    expect(coordAdd(coord1, coord2)).toEqual(coord3);
  });
});

describe('coordMult', () => {
  test('should multiply', () => {
    const coord1 = [2, 3];
    const coord2 = [4, -5];
    const coord3 = [8, -15];
    expect(coordMult(coord1, coord2)).toEqual(coord3);
  });
});

describe('coordEq', () => {
  test('should be equal', () => {
    const coord1 = [2, 3];
    const coord2 = [2, 3];
    expect(coordEq(coord1, coord2)).toEqual(true);
  });

  test('should be not equal', () => {
    const coord1 = [2, 3];
    const coord2 = [2, 4];
    expect(coordEq(coord1, coord2)).toEqual(false);
  });
});

describe('coordCollide', () => {
  test('should collide', () => {
    const coord = [2, 3];
    const coords = [[0, 0], [2, 3], [1, 1]];
    expect(coordCollide(coord, coords)).toEqual(true);
  });

  test('should not collide', () => {
    const coord = [3, 3];
    const coords = [[0, 0], [2, 3], [1, 1]];
    expect(coordCollide(coord, coords)).toEqual(false);
  });
});

describe('coordRotate90', () => {
  [
    {
      coord: [0, 0],
      result: [0, 0],
    },
    {
      coord: [1, 0],
      result: [0, 1],
    },
    {
      coord: [0, 1],
      result: [-1, 0],
    },
    {
      coord: [-1, 0],
      result: [0, -1],
    },
    {
      coord: [0, -1],
      result: [1, 0],
    },
  ].forEach(({ coord, result }) => {
    test(`should rotate 90 [${coord[0]},${coord[1]}]`, () => {
      expect(coordRotate90(coord)).toEqual(result);
    });
  });
});

describe('coordRotate270', () => {
  [
    {
      coord: [0, 0],
      result: [0, 0],
    },
    {
      coord: [1, 0],
      result: [0, -1],
    },
    {
      coord: [0, -1],
      result: [-1, 0],
    },
    {
      coord: [-1, 0],
      result: [0, 1],
    },
    {
      coord: [0, 1],
      result: [1, 0],
    },
  ].forEach(({ coord, result }) => {
    test(`should rotate 270 [${coord[0]},${coord[1]}]`, () => {
      expect(coordRotate270(coord)).toEqual(result);
    });
  });
});

describe('coordRotate180', () => {
  [
    {
      coord: [0, 0],
      result: [0, 0],
    },
    {
      coord: [1, 0],
      result: [-1, 0],
    },
    {
      coord: [-1, 0],
      result: [1, 0],
    },
    {
      coord: [0, 1],
      result: [0, -1],
    },
    {
      coord: [0, -1],
      result: [0, 1],
    },
  ].forEach(({ coord, result }) => {
    test(`should rotate 180 [${coord[0]},${coord[1]}]`, () => {
      expect(coordRotate180(coord)).toEqual(result);
    });
  });
});

describe('coordSortAndUniq', () => {
  [
    {
      coords: [[0, 0]],
      results: [[0, 0]],
    },
    {
      coords: [[1, 1], [1, -1], [-1, 0], [0, -1], [0, 0]],
      results: [[-1, 0], [0, -1], [0, 0], [1, -1], [1, 1]],
    },
    {
      coords: [[0, 0], [0, 0], [1, 1], [1, 1], [2, 2]],
      results: [[0, 0], [1, 1], [2, 2]],
    },
  ].forEach(({ coords, results }, i) => {
    test(`should rotate 180 #${i}`, () => {
      expect(coordSortAndUniq(coords)).toEqual(results);
    });
  });
});
