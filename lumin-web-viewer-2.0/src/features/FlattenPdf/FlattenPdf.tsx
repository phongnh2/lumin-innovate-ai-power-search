import { Checkbox, Text, PlainTooltip, Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import { useTranslation } from 'hooks/useTranslation';

import useHandleFlattenPdf from './hooks/useHandleFlattenPdf';

import styles from './FlattenPdf.module.scss';

const FlattenPdf: React.FC = () => {
  const { t } = useTranslation();
  const { isFlattenPdf, onChange } = useHandleFlattenPdf();

  return (
    <div className={styles.flattenSection}>
      <Checkbox checked={isFlattenPdf} onChange={onChange} />
      <div className={styles.textIconGroup}>
        <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface)">
          {t('viewer.downloadModal.flattenPdf')}
        </Text>
        <PlainTooltip
          content={t('viewer.downloadModal.flattenPdfTooltip')}
          position="bottom-start"
          maw={385}
          offset={{ crossAxis: -10, mainAxis: 10 }}
        >
          <Icomoon type="info-circle-md" size="md" color="var(--kiwi-colors-surface-on-surface)" />
        </PlainTooltip>
      </div>
    </div>
  );
};

export default FlattenPdf;
