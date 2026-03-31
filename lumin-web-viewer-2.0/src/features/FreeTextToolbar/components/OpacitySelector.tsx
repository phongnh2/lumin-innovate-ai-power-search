import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import OpacitySlider from '@new-ui/general-components/OpacitySlider';

import { useTranslation } from 'hooks/useTranslation';

import { useSelectorPopoverManager } from 'features/FreeTextToolbar/hooks/useSelectorPopoverManager';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import SelectorPopover from './SelectorPopover';
import styles from '../FreeTextToolbar.module.scss';
import { BaseFreeTextToolbarSelectorProps } from '../types';

const OpacitySelector = ({ style, onChange }: BaseFreeTextToolbarSelectorProps) => {
  const { t } = useTranslation();
  const { isOpen, toggle } = useSelectorPopoverManager();

  const popoverTrigger = (
    <div className={styles.opacityWrapper}>
      <div className={styles.opacityDrop} style={{ '--opacity': `${style?.Opacity ?? 1}` } as React.CSSProperties} />
      <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface)">
        {`${Math.round((style?.Opacity ?? 1) * 100)}%`}
      </Text>
    </div>
  );

  const popoverContent = <OpacitySlider style={style} onChange={onChange} />;

  return (
    <SelectorPopover
      content={popoverContent}
      trigger={popoverTrigger}
      triggerProps={{
        tooltip: t('option.slider.opacity'),
      }}
      isOpen={isOpen(ANNOTATION_STYLE.OPACITY)}
      onToggle={() => toggle(ANNOTATION_STYLE.OPACITY)}
    />
  );
};

export default OpacitySelector;
