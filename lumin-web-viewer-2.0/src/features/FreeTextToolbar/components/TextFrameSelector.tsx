import { Text } from 'lumin-ui/kiwi-ui';
import React from 'react';

import FillStyle from '@new-ui/general-components/FrameStylePalette/FillStyle';
import StrokeStyle from '@new-ui/general-components/FrameStylePalette/StrokeStyle';

import { useTranslation } from 'hooks/useTranslation';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import SelectorPopover from './SelectorPopover';
import styles from '../FreeTextToolbar.module.scss';
import { useSelectorPopoverManager } from '../hooks/useSelectorPopoverManager';
import { BaseFreeTextToolbarSelectorProps } from '../types';

const TextFrameSelector = ({ style, onChange }: BaseFreeTextToolbarSelectorProps) => {
  const { t } = useTranslation();
  const { isOpen, toggle } = useSelectorPopoverManager();

  const popoverTrigger = (
    <div
      className={styles.textFrameButton}
      style={
        {
          '--fill-color': style.FillColor?.toHexString(),
          '--stroke-color': style.StrokeColor?.toHexString(),
          '--border-width': style?.StrokeThickness ? '2px' : null,
        } as React.CSSProperties
      }
    />
  );

  const popoverContent = (
    <div className={styles.textFramePopover}>
      <div>
        <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.textFrameTitle}>
          {t('generalLayout.toolbar.FillColor')}
        </Text>
        <FillStyle onChange={onChange} style={style} disablePortal />
      </div>
      <div>
        <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface)" className={styles.textFrameTitle}>
          {t('generalLayout.toolProperties.stroke')}
        </Text>
        <StrokeStyle onChange={onChange} style={style} disablePortal />
      </div>
    </div>
  );

  return (
    <SelectorPopover
      content={popoverContent}
      trigger={popoverTrigger}
      triggerProps={{
        tooltip: t('generalLayout.toolProperties.textFrame'),
        buttonProps: {
          style: {
            padding: 'var(--kiwi-spacing-0-75)',
            backgroundColor: 'var(--kiwi-colors-surface-surface-bright)',
          },
        },
      }}
      isOpen={isOpen(ANNOTATION_STYLE.FILL_COLOR)}
      onToggle={() => toggle(ANNOTATION_STYLE.FILL_COLOR)}
    />
  );
};

export default TextFrameSelector;
