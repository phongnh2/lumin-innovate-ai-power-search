import classNames from 'classnames';
import { Button, IconButton, Radio, PlainTooltip, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useDispatch } from 'react-redux';

import { AvailabilityToolCheckProvider } from '@new-ui/HOCs/withValidUserCheck';

import { useTranslation } from 'hooks/useTranslation';

import { COMPRESS_RESOLUTION } from 'features/CompressPdf/constants';
import { compressPdfActions } from 'features/CompressPdf/slices';
import { CompressLevelProps } from 'features/CompressPdf/types';

import { TOOLS_NAME } from 'constants/toolsName';

import CompressLevel from '../CompressLevel';

import styles from './CompressRadioItem.module.scss';

interface CompressRadioItemProps {
  isActive: boolean;
  isDisabled: boolean;
  isFileSizeExceed: boolean;
  compressLevel: CompressLevelProps;
  isBusinessOrEnterprisePlan: boolean;
  enableServerCompression: boolean;
  onChange: (value: CompressLevelProps['resolution'], isDisabled: boolean) => void;
}

const CompressRadioItem = ({
  isActive,
  isDisabled,
  compressLevel,
  onChange,
  isFileSizeExceed,
  enableServerCompression,
}: CompressRadioItemProps) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const renderMaximumSuffix = () => {
    if (compressLevel.resolution !== COMPRESS_RESOLUTION.MAXIMUM) {
      return null;
    }
    if (!isFileSizeExceed && !enableServerCompression) {
      return (
        <AvailabilityToolCheckProvider
          useModal
          toolName={TOOLS_NAME.FORM_BUILDER}
          render={({ toggleCheckPopper }) => (
            <Button variant="filled" colorType="warning" onClick={toggleCheckPopper}>
              <Text type="label" size="md" color="var(--kiwi-colors-semantic-on-warning)">
                {t('common.upgrade')}
              </Text>
            </Button>
          )}
        />
      );
    }
    return (
      <PlainTooltip content={t('viewer.compressPdf.options.tooltip')}>
        <IconButton
          icon="ph-gear"
          disabled={isDisabled}
          onClick={() => {
            dispatch(compressPdfActions.setIsEditingCompressOptions(true));
            dispatch(compressPdfActions.setCompressLevel(COMPRESS_RESOLUTION.MAXIMUM));
          }}
        />
      </PlainTooltip>
    );
  };

  return (
    <div className={styles.radioItemWrapper}>
      <Radio
        size="md"
        disabled={isDisabled}
        value={compressLevel.resolution}
        label={<CompressLevel level={compressLevel} />}
        wrapperProps={{
          className: classNames(styles.radioItem, {
            [styles.activeItem]: isActive,
            [styles.disabledItem]: isDisabled,
          }),
          onClick: () => onChange(compressLevel.resolution, isDisabled),
        }}
      />
      <div className={styles.maximumSuffix}>{renderMaximumSuffix()}</div>
    </div>
  );
};

export default CompressRadioItem;
