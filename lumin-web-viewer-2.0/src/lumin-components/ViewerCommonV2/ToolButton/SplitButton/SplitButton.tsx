import Button, { ButtonProps } from '@mui/material/Button';
import { PlainTooltip } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTheme } from 'styled-components';

import { getShortcut } from '@new-ui/components/LuminToolbar/utils';

import { SingleButtonProps } from 'lumin-components/ViewerCommonV2/ToolButton/SingleButton';
import Icomoon from 'luminComponents/Icomoon';

import InnerSplitButton, { InnerSplitButtonProps } from './InnerSplitButton';

import * as Styled from './SplitButton.styled';

const defaultProps = {
  shortcutId: '',
  className: '',
  icon: '',
  label: '',
  isActive: false,
  secondaryOnClick: () => {},
  onClick: () => {},
  isSecondaryActive: false,
  singleButtonProps: {},
};

export type SplitButtonProps = Omit<ButtonProps, 'size' | 'color'> & {
  shortcutId?: string;
  className?: string;
  icon?: string;
  label?: string;
  isActive?: boolean;
  secondaryOnClick?: () => void;
  onClick?: () => void;
  isSecondaryActive?: boolean;
  singleButtonProps?: SingleButtonProps;
  activeShapeTooltip?: string;
  tooltipDataProps?: InnerSplitButtonProps['tooltipData'];
  secondaryButtonProps?: {
    tooltip: {
      title: string;
    };
  };
};

const SplitButton = React.forwardRef<HTMLDivElement, SplitButtonProps>((props, ref) => {
  const {
    label,
    icon,
    secondaryOnClick,
    isSecondaryActive,
    singleButtonProps,
    isActive,
    onClick,
    disabled,
    shortcutId,
    activeShapeTooltip,
    tooltipDataProps,
    secondaryButtonProps,
  } = props;
  const theme = useTheme();
  const arrowButtonClasses = Styled.useArrowButtonStyles({
    theme,
    active: isSecondaryActive,
  });

  return (
    <Styled.ButtonContainer ref={ref} role="button" data-cy="split_button_container">
      <InnerSplitButton
        data-active={isActive}
        disabled={disabled}
        icon={icon}
        label={label}
        isActive={isActive}
        onClick={onClick}
        {...singleButtonProps}
        tooltipData={{
          location: 'bottom',
          title: activeShapeTooltip || label,
          shortcut: getShortcut(shortcutId),
          ...singleButtonProps?.tooltipData,
          ...tooltipDataProps,
        }}
      />
      <PlainTooltip content={secondaryButtonProps?.tooltip?.title}>
        <Button disableRipple classes={arrowButtonClasses} onClick={secondaryOnClick} disabled={disabled}>
          <Icomoon className="sm_down_stroke" size={20} />
        </Button>
      </PlainTooltip>
    </Styled.ButtonContainer>
  );
});

SplitButton.defaultProps = defaultProps;

export default SplitButton;
