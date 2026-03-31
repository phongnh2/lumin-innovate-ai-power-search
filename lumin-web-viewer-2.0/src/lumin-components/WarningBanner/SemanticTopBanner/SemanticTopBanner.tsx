import { Text, Button, ButtonProps, TextProps } from 'lumin-ui/kiwi-ui';
import React, { ReactNode } from 'react';

import style from './SemanticTopBanner.module.scss';

type BannerTypes = 'info' | 'warning' | 'critical';

type SemanticTopBannerProps = {
  type: BannerTypes;
  content: ReactNode;
  leftIcon?: ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
  cancelButtonTitle?: string;
  confirmButtonTitle?: string;
  cancelButtonProps?: Omit<ButtonProps, 'onClick'>;
  confirmButtonProps?: Omit<ButtonProps, 'onClick'>;
};

type BannerConfig = {
  cancelButtonVariant: ButtonProps['variant'];
  confirmButtonVariant: ButtonProps['variant'];
  typography: {
    size: TextProps['size'];
    type: TextProps['type'];
  };
};

const bannerConfigs: Record<BannerTypes, BannerConfig> = {
  info: {
    cancelButtonVariant: 'text',
    confirmButtonVariant: 'outlined',
    typography: {
      size: 'md',
      type: 'body',
    },
  },
  warning: {
    cancelButtonVariant: 'text',
    confirmButtonVariant: 'outlined',
    typography: {
      size: 'sm',
      type: 'title',
    },
  },
  critical: {
    cancelButtonVariant: 'text',
    confirmButtonVariant: 'filled',
    typography: {
      size: 'sm',
      type: 'title',
    },
  },
};

const SemanticTopBanner = ({
  type,
  content,
  leftIcon,
  onCancel,
  onConfirm,
  cancelButtonTitle,
  confirmButtonTitle,
  cancelButtonProps,
  confirmButtonProps,
}: SemanticTopBannerProps) => {
  const { cancelButtonVariant, confirmButtonVariant, typography } = bannerConfigs[type];

  return (
    <div className={style.container} data-type={type}>
      <div className={style.contentWrapper}>
        {leftIcon && <div className={style.leftIconWrapper}>{leftIcon}</div>}
        <Text {...typography} color="var(--kiwi-colors-surface-on-surface)">
          {content}
        </Text>
      </div>
      <div className={style.actionButtons}>
        {cancelButtonTitle && (
          <Button
            size="md"
            variant={cancelButtonVariant}
            className={style.button}
            {...cancelButtonProps}
            onClick={onCancel}
            data-type={type}
          >
            {cancelButtonTitle}
          </Button>
        )}
        {confirmButtonTitle && (
          <Button
            size="md"
            variant={confirmButtonVariant}
            className={style.button}
            {...confirmButtonProps}
            onClick={onConfirm}
            data-type={type}
          >
            {confirmButtonTitle}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SemanticTopBanner;
