export enum ButtonSize {
  XXS = 'xxs',
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = 'xxl',
}

export interface IButtonSizeResult {
  height: number;
  fontSize: number;
  lineHeight: number;
}

export const getButtonSize = ({ size }: { size: string }): IButtonSizeResult =>
  ({
    [ButtonSize.XXS]: {
      height: 28,
      fontSize: 12,
      lineHeight: 16,
    },
    [ButtonSize.XS]: {
      height: 32,
      fontSize: 12,
      lineHeight: 16,
    },
    [ButtonSize.SM]: {
      height: 36,
      fontSize: 14,
      lineHeight: 20,
    },
    [ButtonSize.MD]: {
      height: 40,
      fontSize: 14,
      lineHeight: 20,
    },
    [ButtonSize.LG]: {
      height: 44,
      fontSize: 14,
      lineHeight: 20,
    },
    [ButtonSize.XL]: {
      height: 48,
      fontSize: 14,
      lineHeight: 20,
    },
    [ButtonSize.XXL]: {
      height: 56,
      fontSize: 17,
      lineHeight: 24,
    },
  }[size]);
