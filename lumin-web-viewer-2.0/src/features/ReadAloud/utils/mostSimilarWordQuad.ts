import { PotentialMatch, SelectedQuad, WordInfo } from '../interfaces';

const calculateQuadSimilarity = (quad1: SelectedQuad, quad2: SelectedQuad): number => {
  const xDiff = Math.abs(quad1.x1 - quad2.x1) + Math.abs(quad1.x4 - quad2.x4);
  const yDiff = Math.abs(quad1.y1 - quad2.y1) + Math.abs(quad1.y4 - quad2.y4);
  return xDiff + yDiff;
};

export default (selectedQuad: SelectedQuad, potentialMatches: PotentialMatch[]): WordInfo | null => {
  if (potentialMatches.length === 0) {
    return null;
  }

  let bestMatch = potentialMatches[0];
  let bestSimilarity = calculateQuadSimilarity(selectedQuad, bestMatch.quad);

  for (let i = 1; i < potentialMatches.length; i++) {
    const similarity = calculateQuadSimilarity(selectedQuad, potentialMatches[i].quad);
    if (similarity < bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = potentialMatches[i];
    }
  }

  return bestMatch.wordInfo;
};
