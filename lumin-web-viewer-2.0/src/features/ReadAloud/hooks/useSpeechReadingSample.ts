import { MutableRefObject, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useSpeechUtteranceEvents } from './useSpeechUtteranceEvents';
import { READ_ALOUD_SAMPLE_TEXT } from '../constants';
import { readAloudActions, readAloudSelectors } from '../slices';

export const useSpeechReadingSample = (
  settingCallback: (utterance: SpeechSynthesisUtterance) => void,
  playingCallback: () => void
) => {
  const dispatch = useDispatch();
  const synth = window.speechSynthesis;
  const isReadingSample = useSelector(readAloudSelectors.isReadingSample);
  const isReadingDocument = useSelector(readAloudSelectors.isReadingDocument);
  const utteranceSampleRef: MutableRefObject<SpeechSynthesisUtterance> = useRef(
    new SpeechSynthesisUtterance(READ_ALOUD_SAMPLE_TEXT)
  );

  const onCompleteReadingSample = () => {
    dispatch(readAloudActions.setIsReadingSample(false));
  };

  useSpeechUtteranceEvents({ utterance: utteranceSampleRef, events: { end: onCompleteReadingSample } });

  const onReadingSample = () => {
    if (isReadingDocument) {
      synth.cancel();
      dispatch(readAloudActions.setIsReadingDocument(false));
    }
    playingCallback();
  };

  useEffect(() => {
    if (!isReadingSample) return;

    const utteranceSample = utteranceSampleRef.current;

    settingCallback(utteranceSample);

    synth.speak(utteranceSample);
  }, [isReadingSample]);

  return { onReadingSample };
};
