/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { Quad, ToolName } from 'core/type';

import core from 'core';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { SelectedQuad } from '../interfaces';
import { readAloudSelectors } from '../slices';
import { IReadAloudSentence } from '../utils/convertToReadAloudSentence';
import { getSelectedTextInfo } from '../utils/getSelectedTextInfo';

export interface IReadingFromSelectedTextInfo {
  wordIndex: number;
  spokenCount: number;
  sentenceIndex: number;
  allSentences: IReadAloudSentence[];
}

interface Props {
  sentences: IReadAloudSentence[];
  getSentences: (pageNumber: number) => Promise<IReadAloudSentence[]>;
}

export const useReadingFromSelectedText = (props: Props) => {
  const { sentences, getSentences } = props;
  const isReadAloudModeReady = useSelector(readAloudSelectors.isReadAloudModeReady);
  const [isGettingSelectedTextInfo, setIsGettingSelectedTextInfo] = useState<boolean>(false);
  const [selectedTextInfo, setSelectedTextInfo] = useState<IReadingFromSelectedTextInfo>(null);

  const onCompleteSelectText = async (startQuad: { pageNumber: number; quad: Quad }) => {
    try {
      setIsGettingSelectedTextInfo(true);
      const { pageNumber, quad } = startQuad;
      const selectedQuad: SelectedQuad = { x1: quad.x1, y1: quad.y1, x4: quad.x4, y4: quad.y4 };

      let allSentences = sentences;
      const isSelectedPageNumberSentencesExist = allSentences.find((sentence) => sentence.pageNumber === pageNumber);

      if (!isSelectedPageNumberSentencesExist) {
        const selectedPageNumberSentences = await getSentences(pageNumber);
        allSentences = [...sentences, ...selectedPageNumberSentences].sort((a, b) => a.pageNumber - b.pageNumber);
      }

      const { sentenceIndex, startIndex } = await getSelectedTextInfo(pageNumber, selectedQuad, allSentences);

      const previousPageTextLength = allSentences
        .slice(0, sentenceIndex)
        .filter((sentence) => sentence.pageNumber === pageNumber)
        .map((sentence) => sentence.value)
        .join('').length;

      setSelectedTextInfo({
        allSentences,
        sentenceIndex,
        spokenCount: previousPageTextLength,
        wordIndex: startIndex - previousPageTextLength,
      });
    } catch (error: unknown) {
      logger.logError({ reason: LOGGER.Service.READ_ALOUD, error });
    } finally {
      setIsGettingSelectedTextInfo(false);
    }
  };

  useEffect(() => {
    if (!isReadAloudModeReady) {
      return undefined;
    }

    const textSelectTool = core.getTool('TextSelect' as ToolName);

    textSelectTool.addEventListener('selectionComplete', onCompleteSelectText);

    return () => {
      textSelectTool.removeEventListener('selectionComplete', onCompleteSelectText);
    };
  }, [isReadAloudModeReady]);

  return { selectedTextInfo, isGettingSelectedTextInfo };
};
