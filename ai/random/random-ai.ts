import { alea } from 'seedrandom';
import { Decision, AITick } from '../ai';

export interface RandomAIBrain {
  seed: string;
}

export const randomAI = ({ brain }: { brain: RandomAIBrain }): AITick => {
  const rng = alea(brain.seed);
  const weight = [rng(), rng(), rng()];
  const weightSum = weight[0] + weight[1] + weight[2];
  return state => {
    let num = rng() * weightSum;
    for (let i = 0; i <= 2; i++) {
      if (num <= weight[i]) {
        return i as Decision;
      }
      num -= weight[i];
    }
    return Decision.None;
  };
};
