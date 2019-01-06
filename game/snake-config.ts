import { Wall, validateWalls } from '../lib/walls';
import { uniencode, unidecode } from '../lib/uniencode';

const getRandomSeed = () =>
  Math.random()
    .toString()
    .slice(2);

export interface SnakeConfig {
  boardWidth: number;
  boardHeight: number;
  initialSize: number;
  foodValue: number;
  foodMult: boolean;
  foodMin: number;
  walls: Wall[];
  seed: string;
}

export const createSnakeConfig = (
  config: Partial<SnakeConfig>,
): SnakeConfig => ({
  boardWidth: Math.max(1, config.boardWidth || 31),
  boardHeight: Math.max(1, config.boardHeight || 31),
  initialSize: Math.max(1, config.initialSize || 3),
  foodValue: Math.max(Number.MIN_VALUE, config.foodValue || 0.1),
  foodMult: config.foodMult != null ? config.foodMult : true,
  foodMin: Math.max(Number.MIN_VALUE, config.foodMin || 1),
  walls:
    config.walls && validateWalls(config.walls) ? config.walls : ([] as Wall[]),
  seed: config.seed || getRandomSeed(),
});

export const serializeSnakeConfig = (config: SnakeConfig): string => {
  return uniencode(config);
};

export const deserializeSnakeConfig = (
  snakeConfigString: string,
): SnakeConfig => {
  const config = unidecode(snakeConfigString);
  return createSnakeConfig(config);
};
