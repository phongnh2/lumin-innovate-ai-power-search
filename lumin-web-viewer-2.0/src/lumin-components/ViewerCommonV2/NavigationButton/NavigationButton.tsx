import classNames from 'classnames';
import { isEmpty } from 'lodash';
import { TooltipProps } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useMemo } from 'react';

import PremiumIcon from 'assets/lumin-svgs/badge_premium.svg';

import { useThemeMode } from 'hooks/useThemeMode';

import logger from 'helpers/logger';

import { ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import { eventTracking } from 'utils/recordUtil';

import UserEventConstants from 'constants/eventConstants';

import { NavigationButtonProps } from './types';
import ToolButtonTooltip from '../ToolButton/ToolButtonTooltip';

import styles from './NavigationButton.module.scss';

const NavigationButton = React.forwardRef<HTMLButtonElement, NavigationButtonProps>(
  (props: NavigationButtonProps, ref) => {
    const {
      className,
      disabled,
      label,
      icon,
      isActive = false,
      onClick,
      eventTrackingName = '',
      tooltipData = {},
      iconSize = 18,
      dataElement = '',
      shouldShowPremiumIcon = false,
      isHovered = false,
      isColorIcon = false,
      isHighlightIcon = false,
      hideLabelOnSmallScreen: _hideLabelOnSmallScreen,
      ...otherProps
    } = props;
    const themeMode = useThemeMode();

    const getIcon = useCallback(() => {
      if (isActive) {
        return icon.active[themeMode];
      }
      return icon.normal[themeMode];
    }, [icon.active, icon.normal, isActive, themeMode]);

    const IconComponent = useMemo(() => getIcon(), [getIcon]);

    const onButtonClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (eventTrackingName) {
        eventTracking(UserEventConstants.EventType.CLICK, {
          elementName: eventTrackingName,
          elementPurpose: ButtonPurpose[eventTrackingName],
        }).catch((err) => logger.logError({ error: err }));
      }
      onClick?.(event);
    };

    const buttonClassName = classNames(
      styles.navigationButton,
      {
        [styles.active]: isActive,
        [styles.hovered]: isHovered,
      },
      className
    );

    const svgClassName = classNames(styles.styledSvg, {
      [styles.colorIcon]: isColorIcon,
    });

    const button = (
      <button
        ref={ref}
        className={buttonClassName}
        disabled={disabled}
        onClick={onButtonClick}
        data-element={dataElement}
        type="button"
        {...otherProps}
      >
        {shouldShowPremiumIcon && (
          <span className={styles.premiumIconWrapper}>
            <img src={PremiumIcon} width={16} alt="premium icon" />
          </span>
        )}
        <div className={styles.iconWrapper} data-icon-highlight={isHighlightIcon}>
          {icon && <IconComponent className={svgClassName} height={iconSize} />}
        </div>
        {label && <span className={styles.label}>{label}</span>}
      </button>
    );

    return !isEmpty(tooltipData) ? (
      <ToolButtonTooltip
        content={String(tooltipData.content || tooltipData.title || '')}
        position={(tooltipData.location || tooltipData.position || 'bottom') as TooltipProps['position']}
        shortcut={(tooltipData.shortcut as string) || null}
        {...(tooltipData as Partial<TooltipProps>)}
      >
        {button}
      </ToolButtonTooltip>
    ) : (
      button
    );
  }
);

export default NavigationButton;
