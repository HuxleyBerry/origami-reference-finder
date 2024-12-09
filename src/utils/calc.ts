import type { Sequence } from "@/types/types";

function getLandmarkChildren(p: number): number[] {
  const q: number[] = [];
  const r: number[] = [];
  q.push(0.25 * p);
  q.push(0.5 * p);
  q.push(0.75 * p);
  q.push((1 - p * p) / 2);
  q.push(Math.pow(1 - p, 2) / 2);
  q.push((1 - Math.sqrt(1 - p * p)) / p);
  q.push(Math.sqrt(1 - p * p) / (p + 1));
  q.push((Math.sqrt(p * p + 1) - 1) / p);
  q.push(Math.sqrt(p * p + 1) - p);
  q.push((Math.sqrt(p * p + 1) - p) * p);
  q.push((Math.sqrt(p * p + 1) + p) * (1 - p));
  q.push((2 * p * p) / Math.pow(p + 1, 2));
  q.push((2 * p) / Math.pow(p + 1, 2));
  q.push(1 / (p + 1));
  q.push(1 / (2 - p));
  if (p <= 0.5) {
    q.push(Math.sqrt(p * 2) - p);
  } else {
    q.push(p - Math.sqrt(p * 2 - 1));
  }
  q.forEach((landmark) => {
    r.push(landmark, 1-landmark)
  })
  return r;
};

function findBest(currentLandmark: number, currentSequence: number[], target: number, foldNum: number, optionsToReport: number, currentDepth: number, bestSequences: Sequence[]) {
  getLandmarkChildren(currentLandmark).forEach((childLandmark, index) => {
    if (currentDepth < foldNum) {
      findBest(childLandmark, [...currentSequence, index], target, foldNum, optionsToReport, currentDepth + 1, bestSequences);
    } else {
      const difference = Math.abs(childLandmark - target);
      if (bestSequences.length < optionsToReport || bestSequences[bestSequences.length - 1].difference > difference) {
        // keep the best n sequences, where n is the variable optionsToReport
        bestSequences.push({difference, sequence: [...currentSequence, index], landmark: childLandmark})
        bestSequences.sort((a,b) => a.difference - b.difference)
        bestSequences.splice(optionsToReport)
      }
    }
  })
}

export function getFoldList(target: number, foldNum: number): [number[], string] {
  const landmark = 0.5;
  const sequence: number[] = []
  const bestSequences: Sequence[] = []
  findBest(landmark, sequence, target, foldNum, 10, 1, bestSequences)
  const errorInfoText = `Resultant landmark is ${bestSequences[0].landmark}. Required landmark was ${target}. This gives an error of ${bestSequences[0].difference}`;
  return [bestSequences[0].sequence, errorInfoText];
};

/*function includesLine(li: Line[], target: Line) { // inbuilt includes function doesn't work when the elements are all arrays
  //uses toFixed(5), because if it differs by less than 5 decimal places then it's not reasonable to fold
  for (let i = 0; i < li.length; i++) {
    if (li[i][0].toFixed(5) === target[0].toFixed(5) && li[i][1].toFixed(5) === target[1].toFixed(5) && li[i][2].toFixed(5) === target[2].toFixed(5) && li[i][3].toFixed(5) === target[3].toFixed(5)) {
      return false;
    } else if (li[i][0].toFixed(5) === target[2].toFixed(5) && li[i][1].toFixed(5) === target[3].toFixed(5) && li[i][2].toFixed(5) === target[0].toFixed(5) && li[i][3].toFixed(5) === target[1].toFixed(5)) {// catch if the labelling is flipped
      return false;
    }
  }
  return true;
};*/