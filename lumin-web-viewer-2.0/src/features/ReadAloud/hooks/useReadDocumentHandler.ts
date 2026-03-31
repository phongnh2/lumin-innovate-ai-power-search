import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import { useCleanup } from 'hooks/useCleanup';
import { useShallowSelector } from 'hooks/useShallowSelector';
import { useTranslation } from 'hooks/useTranslation';

import logger from 'helpers/logger';

import { LocalStorageUtils } from 'utils';
import { getFirstPageExistText } from 'utils/getFirstPageExistText';

import { CUSTOM_DATA_COMMENT_HIGHLIGHT } from 'constants/customDataConstant';
import { DataElements } from 'constants/dataElement';
import { LocalStorageKey } from 'constants/localStorageKey';
import { LOGGER } from 'constants/lumin-common';

import { usePersistReadAloudSettings } from './usePersistReadAloudSettings';
import { useWebSpeechAPI } from './useWebSpeechAPI';
import { READ_ALOUD_SERVICES, SENTENCE_ACTIONS } from '../constants';
import { ICommonVoice, ILanguageOption, ReadAloudState } from '../interfaces';
import { readAloudActions, readAloudSelectors } from '../slices';
import { convertToCommonVoices } from '../utils/convertToCommonVoices';
import { getLanguages } from '../utils/getLanguages';
import { getVoicesByLanguage } from '../utils/getVoicesByLanguage';

export const useReadDocumentHandler = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  usePersistReadAloudSettings();

  const isDocumentLoaded = useSelector(selectors.isDocumentLoaded);
  const isInContentEditMode = useSelector(selectors.isInContentEditMode);

  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const isReadingSample = useSelector(readAloudSelectors.isReadingSample);
  const isReadingDocument = useSelector(readAloudSelectors.isReadingDocument);
  const isCompletedReadDocument = useSelector(readAloudSelectors.isCompletedReadDocument);

  const { activeVoice, activeLanguage } = useShallowSelector(readAloudSelectors.speakingSettings);

  const [languages, setLanguages] = useState<ILanguageOption[]>([]);
  const [voices, setVoices] = useState<ICommonVoice[]>([]);
  const [filteredVoices, setFilteredVoices] = useState<ICommonVoice[]>([]);
  const [isFindingPageExistText, setIsFindingPageExistText] = useState<boolean>(true);
  const [firstPageTextDetected, setFirstPageTextDetected] = useState<number>(null);

  const onJumpToHighlightedAnnotation = () => {
    const highlightedAnnotation = core
      .getAnnotationManager()
      .getAnnotationsList()
      .find((annot) => annot.getCustomData(CUSTOM_DATA_COMMENT_HIGHLIGHT.IS_SPEECH_TEXT_HIGHLIGHTED));

    if (highlightedAnnotation) {
      core.jumpToAnnotation(highlightedAnnotation, { isSmoothScroll: true });
    }
  };

  const { voicesByWebSpeechAPI, onReadingSampleByWebAPI, onReadingDocumentByWebAPI, onCleanUpWebSpeechAPI } =
    useWebSpeechAPI(firstPageTextDetected, onJumpToHighlightedAnnotation);

  const handleReadingByService = ({
    webAPIHandler,
    googleCloudHandler,
  }: {
    webAPIHandler: () => void;
    googleCloudHandler: () => void;
  }) => {
    if (activeVoice?.serviceType === READ_ALOUD_SERVICES.WEB_API) {
      webAPIHandler();
    } else {
      googleCloudHandler();
    }
  };

  const onReadingSample = () => {
    dispatch(readAloudActions.setIsReadingSample(!isReadingSample));
    handleReadingByService({
      webAPIHandler: onReadingSampleByWebAPI,
      googleCloudHandler: () => {}, // TODO
    });
  };

  const onReadingDocument = () => {
    dispatch(readAloudActions.setIsReadingDocument(!isReadingDocument));
    if (isCompletedReadDocument) {
      dispatch(readAloudActions.setIsCompletedReadDocument(false));
    }
    handleReadingByService({
      webAPIHandler: () => onReadingDocumentByWebAPI(null),
      googleCloudHandler: () => {}, // TODO
    });
  };

  const onNextSentence = () => {
    onJumpToHighlightedAnnotation();
    handleReadingByService({
      webAPIHandler: () => onReadingDocumentByWebAPI(SENTENCE_ACTIONS.NEXT),
      googleCloudHandler: () => {}, // TODO
    });
  };

  const onPrevSentence = () => {
    onJumpToHighlightedAnnotation();
    if (isCompletedReadDocument) {
      dispatch(readAloudActions.setIsCompletedReadDocument(false));
    }
    handleReadingByService({
      webAPIHandler: () => onReadingDocumentByWebAPI(SENTENCE_ACTIONS.PREVIOUS),
      googleCloudHandler: () => {}, // TODO
    });
  };

  const findPageExistText = async () => {
    try {
      const page = await getFirstPageExistText();
      setFirstPageTextDetected(page);
    } catch (error: unknown) {
      logger.logError({ reason: LOGGER.Service.READ_ALOUD, error });
    } finally {
      setIsFindingPageExistText(false);
    }
  };

  const getStoragedSettings = (listVoices: ICommonVoice[]) => {
    const storagedSettings = JSON.parse(
      LocalStorageUtils.get({
        key: LocalStorageKey.READ_ALOUD_SETTING,
      })
    ) as ReadAloudState['speakingSettings'];
    const storagedVoice = listVoices.find((item: ICommonVoice) => item.value === storagedSettings?.activeVoice?.value);
    return { storagedVoice };
  };

  const setDefaultBrowserVoiceSettings = useCallback(() => {
    const browserDefault = voices.filter((item: ICommonVoice) => item.isDefault)[0] || voices[0];
    if (!browserDefault) return;

    dispatch(readAloudActions.setSpeakingLanguage(browserDefault.language));
    const voicesByBrowserDefault = getVoicesByLanguage({ language: browserDefault.language, voices });
    setFilteredVoices(voicesByBrowserDefault);
    dispatch(readAloudActions.setSpeakingVoice(browserDefault));
  }, [dispatch, voices]);

  useEffect(() => {
    if (!isInReadAloudMode) {
      return;
    }

    const commonVoices = convertToCommonVoices(voicesByWebSpeechAPI);
    setVoices(commonVoices);
    setLanguages(getLanguages({ voices: commonVoices, t }));
  }, [voicesByWebSpeechAPI, isInReadAloudMode]);

  useEffect(() => {
    if (!voices.length) {
      return;
    }
    const voicesByActiveLanguage = getVoicesByLanguage({ language: activeLanguage, voices });
    if (!voicesByActiveLanguage.length) {
      setDefaultBrowserVoiceSettings();
      return;
    }
    setFilteredVoices(voicesByActiveLanguage);

    const { storagedVoice } = getStoragedSettings(voicesByActiveLanguage);
    const currentVoice = voicesByActiveLanguage.filter((item) => item.isDefault)[0] || voicesByActiveLanguage[0];
    dispatch(readAloudActions.setSpeakingVoice(storagedVoice || currentVoice));
  }, [activeLanguage, voices]);

  useEffect(() => {
    if (!isDocumentLoaded || isInContentEditMode) {
      return undefined;
    }

    findPageExistText().catch(() => {});

    const onPageUpdated = () => {
      findPageExistText().catch(() => {});
    };

    core.addEventListener('pagesUpdated', onPageUpdated);

    return () => {
      core.removeEventListener('pagesUpdated', onPageUpdated);
    };
  }, [isDocumentLoaded, isInContentEditMode]);

  useCleanup(() => {
    if (isInReadAloudMode) {
      onCleanUpWebSpeechAPI();
    }
    dispatch(actions.closeElements(DataElements.CONTEXT_MENU_POPUP));
    window.speechSynthesis.cancel();
  }, [isInReadAloudMode]);

  return {
    isReadingDocument,
    filteredVoices,
    onNextSentence,
    onPrevSentence,
    onReadingSample,
    onReadingDocument,
    languages,
    isFindingPageExistText,
    firstPageTextDetected,
    voicesByWebSpeechAPI,
  };
};
