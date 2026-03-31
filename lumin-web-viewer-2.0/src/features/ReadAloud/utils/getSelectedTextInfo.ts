/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { isEqual } from 'lodash';

import { Quad } from 'core/type';

import core from 'core';

import { IReadAloudSentence } from './convertToReadAloudSentence';
import mostSimilarWordQuad from './mostSimilarWordQuad';
import { PotentialMatch, SelectedQuad, WordInfo } from '../interfaces';

const potentialMatches: PotentialMatch[] = [];

const extractWordsWithPositions = (pageNumber: number, allSentences: IReadAloudSentence[]): WordInfo[] => {
  const words: WordInfo[] = [];
  let currentIndex = 0;

  allSentences.forEach((sentence, sentenceIndex) => {
    if (sentence.pageNumber !== pageNumber) return;

    const wordsInSentence = sentence.value.trim().split(/\s+/);

    wordsInSentence.forEach((word) => {
      if (!word.length) {
        return;
      }
      const startIndex = currentIndex;
      const endIndex = startIndex + word.length;

      words.push({ word, startIndex, endIndex, sentenceIndex });
      currentIndex = endIndex + 1;
    });
  });

  return words;
};

const hasAtLeastQuadParamMatch = (quad1: SelectedQuad, quad2: SelectedQuad): boolean =>
  quad1.x1 === quad2.x1 || quad1.y1 === quad2.y1 || quad1.x4 === quad2.x4 || quad1.y4 === quad2.y4;

const findMatchingWord = async (
  pageNumber: number,
  wordInfo: WordInfo,
  selectedQuad: SelectedQuad
): Promise<{ startIndex: number; sentenceIndex: number } | null> => {
  const { startIndex, endIndex, sentenceIndex } = wordInfo;

  const quads = (await core.getTextPosition(pageNumber, startIndex, endIndex)) as Quad[];

  for (const quad of quads) {
    const quadAsSelectedQuad: SelectedQuad = {
      x1: quad.x1,
      y1: quad.y1,
      x4: quad.x4,
      y4: quad.y4,
    };

    if (isEqual(quadAsSelectedQuad, selectedQuad)) {
      return { startIndex, sentenceIndex };
    }

    if (hasAtLeastQuadParamMatch(quadAsSelectedQuad, selectedQuad)) {
      potentialMatches.push({
        quad,
        wordInfo,
      });
    }
  }

  return null;
};

export const getSelectedTextInfo = async (
  pageNumber: number,
  selectedQuad: SelectedQuad,
  allSentences: IReadAloudSentence[]
): Promise<{ startIndex: number; sentenceIndex: number } | null> => {
  const wordsWithPositions = extractWordsWithPositions(pageNumber, allSentences);

  for (const wordInfo of wordsWithPositions) {
    const matchedWord = await findMatchingWord(pageNumber, wordInfo, selectedQuad);
    if (matchedWord) {
      return matchedWord;
    }
  }

  return mostSimilarWordQuad(selectedQuad, potentialMatches);
};
