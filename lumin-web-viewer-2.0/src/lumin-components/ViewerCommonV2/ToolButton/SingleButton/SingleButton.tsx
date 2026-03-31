import Button, { ButtonProps } from '@mui/material/Button';
import { isEmpty } from 'lodash';
import { Icomoon as KiwiIcomoon, PlainTooltip } from 'lumin-ui/kiwi-ui';
import React, { ComponentProps } from 'react';
import { useTheme } from 'styled-components';

import PremiumIcon from 'assets/lumin-svgs/badge_premium.svg';

import { TooltipProps } from 'luminComponents/GeneralLayout/general-components/Tooltip';
import Icomoon from 'luminComponents/Icomoon';

import { eventTracking } from 'utils';
import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import UserEventConstants from 'constants/eventConstants';

import ToolButtonTooltip from '../ToolButtonTooltip';

import * as Styled from './SingleButton.styled';

export type SingleButtonProps = Omit<ButtonProps, 'size' | 'color'> & {
  className?: string;
  icon?: string;
  label?: string;
  isActive?: boolean;
  showArrow?: boolean;
  eventTrackingName?: string;
  onClick?: (e?: React.MouseEvent) => void;
  /**
   * @deprecated use tooltipProps instead
   */
  tooltipData?: Omit<TooltipProps, 'children'> | null;
  tooltipProps?: Omit<ComponentProps<typeof PlainTooltip>, 'children'> & { shortcut?: TooltipProps['shortcut'] };
  iconSize?: number;
  disabled?: boolean;
  hideLabelOnSmallScreen?: boolean;
  dataElement?: string;
  iconColor?: string;
  shouldShowPremiumIcon?: boolean;
  isUsingKiwiIcon?: boolean;
};

const SingleButton = React.forwardRef((props: SingleButtonProps, ref) => {
  const {
    className,
    disabled,
    label,
    icon,
    isActive,
    showArrow,
    onClick: onClickProp,
    eventTrackingName,
    tooltipData,
    tooltipProps,
    iconSize,
    hideLabelOnSmallScreen,
    dataElement,
    iconColor,
    shouldShowPremiumIcon,
    isUsingKiwiIcon = false,
    ...otherProps
  } = props;
  const theme = useTheme();
  const customClasses = Styled.useStyles({
    theme,
    isActive,
  });
  const { title, placement, location, shortcut } = tooltipData || {};

  const renderIcon = () => {
    if (isUsingKiwiIcon) {
      return <KiwiIcomoon type={icon} size="lg" />;
    }

    return <Icomoon className={icon} size={iconSize} {...(iconColor ? { style: { color: iconColor } } : {})} />;
  };

  const onClick = (args: any): void => {
    if (eventTrackingName) {
      eventTracking(UserEventConstants.EventType.HEADER_BUTTON, {
        elementName: eventTrackingName,
        elementPurpose: ButtonPurpose[eventTrackingName],
      }).catch((err) => console.error(err));
    }

    onClickProp(args);
  };

  const button = (
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    <Button
      classes={customClasses}
      className={className}
      disabled={disabled}
      ref={ref}
      onClick={onClick}
      data-element={dataElement}
      {...otherProps}
    >
      {shouldShowPremiumIcon && (
        <Styled.PremiumIconWrapper>
          <img src={PremiumIcon} alt="premium icon" width={16} />
        </Styled.PremiumIconWrapper>
      )}
      {icon && renderIcon()}
      {label && <Styled.LabelText $hideLabelOnSmallScreen={hideLabelOnSmallScreen}>{label}</Styled.LabelText>}
      {showArrow && <Icomoon className="sm_down_stroke" size={20} />}
    </Button>
  );

  return !isEmpty(tooltipData) || !isEmpty(tooltipProps) ? (
    <ToolButtonTooltip
      content={title || tooltipProps?.content}
      shortcut={shortcut}
      position={placement || location}
      {...tooltipProps}
    >
      <div>{button}</div>
    </ToolButtonTooltip>
  ) : (
    button
  );
});

SingleButton.defaultProps = {
  className: '',
  icon: '',
  label: '',
  isActive: false,
  showArrow: false,
  eventTrackingName: '',
  onClick: () => {},
  iconSize: 18,
  disabled: false,
  hideLabelOnSmallScreen: false,
  dataElement: '',
  iconColor: '',
  shouldShowPremiumIcon: false,
  tooltipData: null,
};

export default SingleButton;
