import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import SingleButton from 'luminComponents/ViewerCommonV2/ToolButton/SingleButton';

import { useReadAloudContext } from 'features/ReadAloud/hooks/useReadAloudContext';
import { readAloudSelectors } from 'features/ReadAloud/slices';

const PlayControl = () => {
  const { t } = useTranslation();
  const { isReadingDocument, onReadingDocument, onNextSentence, onPrevSentence } = useReadAloudContext();
  const isCompletedReadDocument = useSelector(readAloudSelectors.isCompletedReadDocument);
  const isReadAloudModeReady = useSelector(readAloudSelectors.isReadAloudModeReady);

  return (
    <>
      <SingleButton
        isUsingKiwiIcon
        icon="play-previous"
        tooltipData={{
          title: t('viewer.readAloud.previousSentence'),
          placement: 'bottom',
        }}
        onClick={onPrevSentence}
        disabled={!isReadAloudModeReady}
      />
      <SingleButton
        isUsingKiwiIcon
        icon={isReadingDocument ? 'play-pause' : 'play-continue'}
        tooltipData={{
          title: isReadingDocument ? t('viewer.readAloud.pause') : t('viewer.readAloud.play'),
          placement: 'bottom',
        }}
        onClick={onReadingDocument}
        disabled={!isReadAloudModeReady}
      />
      <SingleButton
        disabled={isCompletedReadDocument || !isReadAloudModeReady}
        isUsingKiwiIcon
        icon="play-next"
        tooltipData={{
          title: t('viewer.readAloud.nextSentence'),
          placeholder: 'bottom',
        }}
        onClick={onNextSentence}
      />
    </>
  );
};

export default PlayControl;
