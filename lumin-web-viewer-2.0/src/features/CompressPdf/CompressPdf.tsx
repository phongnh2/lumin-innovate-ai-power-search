import { RadioGroup, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import CompressRadioItem from './components/CompressRadioItem';
import CompressWarning from './components/CompressWarning';
import { COMPRESS_LEVELS } from './constants';
import { useCompressLevelValidation } from './hooks/useCompressLevelValidation';
import { useEnabledCompressPdf } from './hooks/useEnabledCompressPdf';
import { compressPdfActions, compressPdfSelectors } from './slices';
import { CompressLevelType } from './types';

import styles from './CompressPdf.module.scss';

const CompressPdf = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isEnabled: isEnabledCompressPdf } = useEnabledCompressPdf();
  const {
    isMember,
    canStartTrial,
    isFileSizeExceed,
    isBusinessOrEnterprisePlan,
    isCompressLevelDisabled,
    enableServerCompression,
  } = useCompressLevelValidation();
  const currentCompressLevel = useSelector(compressPdfSelectors.getCompressLevel);

  if (!isEnabledCompressPdf) {
    return null;
  }

  const onChangeCompressLevel = (value: CompressLevelType, isDisabled: boolean) => {
    if (isDisabled) return;
    dispatch(compressPdfActions.setCompressLevel(value));
  };

  return (
    <div className={styles.compress}>
      <Text type="label" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
        {t('viewer.compressPdf.title')}
      </Text>
      <RadioGroup value={currentCompressLevel} wrapperProps={{ className: styles.radioGroup }}>
        {COMPRESS_LEVELS.map((level) => (
          <CompressRadioItem
            key={level.quality}
            compressLevel={level}
            onChange={onChangeCompressLevel}
            isActive={currentCompressLevel === level.resolution}
            isDisabled={isCompressLevelDisabled(level.quality)}
            isFileSizeExceed={isFileSizeExceed}
            isBusinessOrEnterprisePlan={isBusinessOrEnterprisePlan}
            enableServerCompression={enableServerCompression}
          />
        ))}
      </RadioGroup>
      <CompressWarning
        isMember={isMember}
        canStartTrial={canStartTrial}
        isFileSizeExceed={isFileSizeExceed}
        isBusinessOrEnterprisePlan={isBusinessOrEnterprisePlan}
        enableServerCompression={enableServerCompression}
      />
    </div>
  );
};

export default CompressPdf;
