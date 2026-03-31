import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from 'styled-components';

import { Quad } from 'core/type';

import core from 'core';
import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import logger from 'helpers/logger';

import { LOGGER } from 'constants/lumin-common';

import { useGetReadAloudSentences } from './useGetReadAloudSentences';
import { IReadingFromSelectedTextInfo, useReadingFromSelectedText } from './useReadingFromSelectedText';
import { useSpeechReadingSample } from './useSpeechReadingSample';
import { useSpeechUtteranceEvents } from './useSpeechUtteranceEvents';
import { SENTENCE_ACTIONS } from '../constants';
import { readAloudActions, readAloudSelectors } from '../slices';
import { IReadAloudSentence } from '../utils/convertToReadAloudSentence';
import { onDeleteSpeechTextHighlighted, onHighlightSpeechText } from '../utils/onHighlightSpeechText';

export const useWebSpeechAPI = (firstPageTextDetected: number, onJumpToHighlightedAnnotation: () => void) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const synth = window.speechSynthesis;

  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isReadAloudModeReady = useSelector(readAloudSelectors.isReadAloudModeReady);

  const spokenPageTextCountRef = useRef(0);
  const allSentencesRef = useRef<IReadAloudSentence[]>([]);
  const scrollBehaviorRef = useRef({
    isScrolling: false,
    verticalOffset: 0,
  });

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(0);
  const [isReachTheEndOfDocument, setIsReachTheEndOfDocument] = useState<boolean>(false);

  const { getSentences } = useGetReadAloudSentences();

  const { selectedTextInfo, isGettingSelectedTextInfo } = useReadingFromSelectedText({
    sentences: allSentencesRef.current,
    getSentences,
  });
  const selectedTextInfoRef = useRef<IReadingFromSelectedTextInfo>(null);

  const resetCurrentWordIndex = () => {
    selectedTextInfoRef.current = null;
    setCurrentWordIndex(0);
  };

  const onReachTheEndOfDocument = () => {
    setIsReachTheEndOfDocument(true);
    if (!synth.speaking) {
      dispatch(readAloudActions.setIsReadingDocument(false));
    }
    dispatch(readAloudActions.setIsCompletedReadDocument(true));
  };

  const getPageSentences = async (pageNumber: number, isFirstPageDetected: boolean) => {
    try {
      const totalPages = core.getTotalPages();
      const sentences = await getSentences(pageNumber);

      if (!sentences.length) {
        if (pageNumber === totalPages) {
          onReachTheEndOfDocument();
          return;
        }
        await getPageSentences(pageNumber + 1, false);
      }

      if (!isFirstPageDetected) {
        spokenPageTextCountRef.current = 0;
        synth.cancel();
        setCurrentSentenceIndex(currentSentenceIndex + 1);
      }

      dispatch(readAloudActions.setIsReadAloudModeReady(true));
      allSentencesRef.current = isFirstPageDetected
        ? sentences
        : [...allSentencesRef.current, ...sentences].sort((a, b) => a.pageNumber - b.pageNumber);
    } catch (error: unknown) {
      logger.logError({ reason: LOGGER.Service.READ_ALOUD, error });
    }
  };

  useEffect(() => {
    if (!firstPageTextDetected || !isDocumentLoaded || !isInReadAloudMode) {
      return;
    }
    getPageSentences(firstPageTextDetected, true).catch(() => {});
  }, [firstPageTextDetected, isDocumentLoaded, isInReadAloudMode]);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const getVoiceList = useCallback(() => {
    const newVoices = synth.getVoices();
    setVoices(newVoices);
  }, []);

  useEffect(() => {
    getVoiceList();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = getVoiceList;
    }

    return () => {
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = null;
      }
    };
  }, []);

  const isReadingSample = useSelector(readAloudSelectors.isReadingSample);
  const isReadingDocument = useSelector(readAloudSelectors.isReadingDocument);
  const isCompletedReadDocument = useSelector(readAloudSelectors.isCompletedReadDocument);

  const utteranceDocumentRef: MutableRefObject<SpeechSynthesisUtterance> = useRef(new SpeechSynthesisUtterance());

  const { activeVoice, pitch, rate } = useShallowSelector(readAloudSelectors.speakingSettings);

  const setReadingSettings = (utterance: SpeechSynthesisUtterance) => {
    utterance.pitch = pitch;
    utterance.rate = rate;
    voices.forEach((voice) => {
      if (voice.name === activeVoice?.name) {
        utterance.voice = voice;
      }
    });
  };

  const onPauseOrResume = () => {
    if (!synth.speaking) {
      return;
    }

    if (synth.paused) {
      synth.resume();
    } else {
      resetCurrentWordIndex();
      synth.pause();
    }
  };

  const { onReadingSample } = useSpeechReadingSample(setReadingSettings, onPauseOrResume);

  const moveToNextSentence = async () => {
    if (isReachTheEndOfDocument) {
      return;
    }

    const currentPage = core.getCurrentPage();
    const totalPages = core.getTotalPages();
    const allSentences = allSentencesRef.current;
    const currentSentence = allSentences[currentSentenceIndex];

    if (currentSentence.isLastSentenceOfPage) {
      if (totalPages === currentSentence.pageNumber) {
        onReachTheEndOfDocument();
        return;
      }

      if (!scrollBehaviorRef.current.isScrolling && currentPage === currentSentence.pageNumber) {
        onJumpToHighlightedAnnotation();
      }

      scrollBehaviorRef.current.verticalOffset = 0;
      await getPageSentences(currentSentence.pageNumber + 1, false);
    } else {
      synth.cancel();
      spokenPageTextCountRef.current += currentSentence.value.length;
      setCurrentSentenceIndex(currentSentenceIndex + 1);
    }
  };

  const backToPreviousSentence = () => {
    const allSentences = allSentencesRef.current;
    const currentSentence = allSentences[currentSentenceIndex];

    setIsReachTheEndOfDocument(false);

    // return early at the beginning of the first page
    if (currentSentence.isFirstSentenceOfPage && currentSentence.pageNumber === firstPageTextDetected) {
      return;
    }

    synth.cancel();

    if (currentSentence.isFirstSentenceOfPage) {
      // back to the last sentence previous page
      const previousPageIndex = currentSentence.pageNumber - 1;
      const previousPageTextLength = allSentences
        .filter((sentence) => sentence.pageNumber === previousPageIndex)
        .map((sentence) => sentence.value)
        .join('').length;
      const previousSentenceLength = allSentences[currentSentenceIndex - 1].value.length;

      spokenPageTextCountRef.current = previousPageTextLength - previousSentenceLength;
    } else {
      // back to the previous sentence in the same page
      spokenPageTextCountRef.current -= allSentences[currentSentenceIndex - 1].value.length;
    }

    setCurrentSentenceIndex(currentSentenceIndex - 1);
  };

  const onSentenceControls = (sentenceAction: string) => {
    const { NEXT, PREVIOUS } = SENTENCE_ACTIONS;

    if (!isReadingDocument) {
      dispatch(readAloudActions.setIsReadingDocument(true));
    }

    resetCurrentWordIndex();

    if (sentenceAction === NEXT) {
      moveToNextSentence().catch(() => {});
    }

    if (sentenceAction === PREVIOUS) {
      backToPreviousSentence();
    }
  };

  const onReadingDocument = (sentenceAction: string) => {
    if (!sentenceAction) {
      if (isCompletedReadDocument) {
        spokenPageTextCountRef.current = 0;
        setCurrentSentenceIndex(0);
        setIsReachTheEndOfDocument(false);
      }

      if (isReadingSample) {
        synth.cancel();
        dispatch(readAloudActions.setIsReadingSample(false));
      }

      if (synth.paused || (currentWordIndex > 0 && !isReadingDocument)) {
        onJumpToHighlightedAnnotation();
      }

      onPauseOrResume();
    } else {
      onSentenceControls(sentenceAction);
    }
  };

  const onCleanup = () => {
    synth.cancel();
    onDeleteSpeechTextHighlighted();
    setCurrentSentenceIndex(0);
    resetCurrentWordIndex();
    spokenPageTextCountRef.current = 0;

    dispatch(readAloudActions.resetReadAloud());
    dispatch(readAloudActions.setIsReadAloudModeReady(false));
  };

  const onBoundaryDocument = async (event: SpeechSynthesisEvent) => {
    const allSentences = allSentencesRef.current;
    const currentSentence = allSentences[currentSentenceIndex];
    const wordStartIndex = event.charIndex;
    const word = event.utterance.text.substring(wordStartIndex).split(' ')[0];
    const wordEndIndex = wordStartIndex + word.length;

    if (wordEndIndex <= wordStartIndex) {
      return;
    }

    const spokenPageTextCount = spokenPageTextCountRef.current;
    const wordIndex = selectedTextInfoRef.current?.wordIndex || currentWordIndex;
    const defaultValue = spokenPageTextCount + currentSentence.value.slice(0, wordIndex).length;

    await onHighlightSpeechText({
      pageNumber: currentSentence.pageNumber,
      from: wordStartIndex + defaultValue,
      to: wordEndIndex + defaultValue,
      strokeColor: theme.kiwi_colors_core_primary,
      scrollBehavior: scrollBehaviorRef.current,
    });

    setCurrentWordIndex(wordStartIndex);
  };

  const onEndDocument = () => {
    resetCurrentWordIndex();
    moveToNextSentence().catch(() => {});
  };

  const configureSpeechUtterance = (sentenceIndex: number, wordIndex: number) => {
    const utterance = utteranceDocumentRef.current;
    const allSentences = allSentencesRef.current;
    const currentSentence = allSentences[sentenceIndex];
    utterance.text = currentSentence.value.slice(wordIndex);
    setReadingSettings(utterance);
    synth.speak(utterance);
  };

  useEffect(() => {
    if (!isReadingDocument || selectedTextInfoRef.current) {
      return;
    }

    const currentPageDocViewer = core.getCurrentPage();

    if (currentSentenceIndex === 0 && currentPageDocViewer !== firstPageTextDetected) {
      core.setCurrentPage(firstPageTextDetected);
    }

    configureSpeechUtterance(currentSentenceIndex, currentWordIndex);
  }, [isReadingDocument, currentSentenceIndex]);

  useSpeechUtteranceEvents({
    utterance: utteranceDocumentRef,
    events: { boundary: onBoundaryDocument, end: onEndDocument },
    deps: [currentSentenceIndex, selectedTextInfo],
  });

  useEffect(() => {
    if (isGettingSelectedTextInfo || !selectedTextInfo) {
      return;
    }
    const { wordIndex, spokenCount, sentenceIndex, allSentences } = selectedTextInfo;
    selectedTextInfoRef.current = selectedTextInfo;
    synth.cancel();
    setCurrentWordIndex(wordIndex);
    setCurrentSentenceIndex(sentenceIndex);
    allSentencesRef.current = allSentences;
    spokenPageTextCountRef.current = spokenCount;
    dispatch(readAloudActions.setIsReadingDocument(true));
    configureSpeechUtterance(sentenceIndex, wordIndex);
  }, [isGettingSelectedTextInfo, selectedTextInfo]);

  useEffect(() => {
    synth.cancel();
    dispatch(readAloudActions.resetReadAloud());
  }, [activeVoice, pitch, rate]);

  useEffect(() => {
    if (!isReadAloudModeReady) {
      return undefined;
    }

    const allSentences = allSentencesRef.current;

    const { pageNumber } = allSentences[currentSentenceIndex];

    const { docViewer } = core;

    const onStartScrollDocView = () => {
      scrollBehaviorRef.current.isScrolling = true;
    };

    const onEndScrollDocView = () => {
      const docViewerVerticalOffset = docViewer.getViewportRegionRect(pageNumber || core.getCurrentPage()) as Quad;
      scrollBehaviorRef.current.verticalOffset = docViewerVerticalOffset?.y1;
      scrollBehaviorRef.current.isScrolling = false;
    };

    docViewer.getScrollViewElement().addEventListener('scroll', onStartScrollDocView);
    docViewer.getScrollViewElement().addEventListener('scrollend', onEndScrollDocView);

    return () => {
      docViewer.getScrollViewElement().removeEventListener('scroll', onStartScrollDocView);
      docViewer.getScrollViewElement().removeEventListener('scrollend', onEndScrollDocView);
    };
  }, [isReadAloudModeReady, currentSentenceIndex]);

  return {
    voicesByWebSpeechAPI: voices,
    onCleanUpWebSpeechAPI: onCleanup,
    onReadingSampleByWebAPI: onReadingSample,
    onReadingDocumentByWebAPI: onReadingDocument,
  };
};
