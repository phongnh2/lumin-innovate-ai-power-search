import { Icomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';

import ColorPalette from '@new-ui/general-components/ColorPalette';

import { useTranslation } from 'hooks/useTranslation';

import { ANNOTATION_STYLE } from 'constants/documentConstants';

import SelectorPopover from './SelectorPopover';
import styles from '../FreeTextToolbar.module.scss';
import { useSelectorPopoverManager } from '../hooks/useSelectorPopoverManager';
import { BaseFreeTextToolbarSelectorProps } from '../types';

const TextColorSelector = ({ style, onChange }: BaseFreeTextToolbarSelectorProps) => {
  const { t } = useTranslation();
  const { isOpen, toggle } = useSelectorPopoverManager();

  const onColorPaletteChange = (_: unknown, value: string) => {
    onChange(ANNOTATION_STYLE.TEXT_COLOR, value);
  };

  const popoverTrigger = (
    <div className={styles.textColorWrapper}>
      <Icomoon type="ph-text-t" size="md" color="var(--kiwi-colors-surface-on-surface)" />
      <div className={styles.textColorHorizon} style={{ backgroundColor: style.TextColor?.toHexString() }} />
    </div>
  );

  const popoverContent = <ColorPalette onChange={onColorPaletteChange} value={style.TextColor} disablePortal />;

  return (
    <SelectorPopover
      width={278}
      content={popoverContent}
      trigger={popoverTrigger}
      triggerProps={{
        tooltip: t('option.annotationColor.TextColor'),
        buttonProps: {
          style: {
            padding: 'var(--kiwi-spacing-0-5) var(--kiwi-spacing-0-75)',
          },
        },
      }}
      isOpen={isOpen(ANNOTATION_STYLE.TEXT_COLOR)}
      onToggle={() => toggle(ANNOTATION_STYLE.TEXT_COLOR)}
    />
  );
};

export default TextColorSelector;
