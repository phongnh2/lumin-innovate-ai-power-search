import { Badge, IconButton, Text } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { Trans } from 'react-i18next';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';

import { useTranslation } from 'hooks/useTranslation';

import styles from './QuickSearchGuideline.module.scss';

interface QuickSearchGuidelineProps {
  onClose: () => void;
}

const QuickSearchGuideline = ({ onClose }: QuickSearchGuidelineProps) => {
  const { t } = useTranslation();
  const [altKey, key] = getShortcut('quickSearch').split(' ');

  return (
    <div className={styles.guideline}>
      <div className={styles.head}>
        <Badge
          size="sm"
          variant="other"
          style={{
            color: 'var(--kiwi-colors-semantic-on-information)',
            backgroundColor: 'var(--kiwi-colors-semantic-information)',
          }}
        >
          {t('viewer.badges.new')}
        </Badge>
        <IconButton
          icon="ph-x"
          size="sm"
          className={styles.close}
          iconColor="var(--kiwi-colors-surface-on-surface)"
          onClick={onClose}
        />
      </div>
      <div>
        <Text type="title" size="xs" color="var(--kiwi-colors-surface-on-surface)">
          {t('viewer.quickSearch.guideline.label')}
        </Text>
        <Text type="body" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
          <Trans
            i18nKey="viewer.quickSearch.guideline.desc"
            components={{
              badge: (
                <Badge
                  size="sm"
                  variant="outline"
                  style={{
                    color: 'var(--kiwi-colors-surface-on-surface-variant)',
                    borderColor: 'var(--kiwi-colors-surface-on-surface-variant)',
                  }}
                />
              ),
            }}
            values={{ altKey, key }}
          />
        </Text>
      </div>
    </div>
  );
};

export default QuickSearchGuideline;
