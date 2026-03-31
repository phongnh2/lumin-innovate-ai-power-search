import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import { useEstimateCompressedSize } from 'features/CompressPdf/hooks/useEstimateCompressdSize';
import { CompressLevelProps } from 'features/CompressPdf/types';

import styles from './CompressLevel.module.scss';

const CompressLevel = ({ level }: { level: CompressLevelProps }) => {
  const { t } = useTranslation();
  const estimatedSize = useEstimateCompressedSize(level.resolution);
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>
        <Text size="sm" type="title" color="var(--kiwi-colors-surface-on-surface)">
          {t(`viewer.compressPdf.levels.${level.transKey}.title`)}
        </Text>
        <Text size="sm" type="title" color="var(--kiwi-colors-surface-on-surface-variant)">
          ({t(`viewer.compressPdf.levels.${level.transKey}.description`)})
        </Text>
      </div>
      <Text size="sm" type="body" color="var(--kiwi-colors-surface-on-surface-variant)">
        {estimatedSize}
      </Text>
    </div>
  );
};

export default CompressLevel;
