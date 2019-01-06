import { alea } from 'seedrandom';
import { Decision, AITick } from '../ai';

export interface RandomAIBrain {
  seed: string;
  weights: [number, number, number];
}

export const createRandomAIBrainFromName = (name: string): RandomAIBrain => {
  const rng = alea(name);
  const weights: [number, number, number] = [rng(), rng(), rng()];
  return {
    seed: name,
    weights,
  };
};

export const randomAI = ({ brain }: { brain: RandomAIBrain }): AITick => {
  const rng = alea(brain.seed);
  const weightsSum = brain.weights[0] + brain.weights[1] + brain.weights[2];
  return () => {
    let num = rng() * weightsSum;
    for (let i = 0; i <= 2; i++) {
      if (num <= brain.weights[i]) {
        return i as Decision;
      }
      num -= brain.weights[i];
    }
    return Decision.None;
  };
};
