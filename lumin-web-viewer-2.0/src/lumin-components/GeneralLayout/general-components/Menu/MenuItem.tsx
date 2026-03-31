import MuiMenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import { Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useTheme } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';
import SvgElement from 'luminComponents/SvgElement';

import { useMenuContext } from './MenuContext';

import * as Styled from './Menu.styled';

interface LuminMenuItemProps extends MenuItemProps {
  size?: 'small' | 'medium' | 'large';
  icon?: string;
  svgIcon?: string;
  desc?: string;
  hideIcon?: boolean;
  blankPrefix?: boolean;
  activated?: boolean;
  renderSuffix?: ({ disabled }: { disabled: boolean }) => React.ReactElement;
  iconSize?: number;
  inheritFont?: boolean;
  disabled?: boolean;
  style?: object;
  displayCheckIcon?: boolean;
  isUsingKiwiIcon?: boolean;
  kiwiIconProps?: Record<string, unknown>;
}

const MenuItem = React.forwardRef<HTMLLIElement, LuminMenuItemProps>(
  (
    {
      size,
      icon,
      children,
      hideIcon,
      svgIcon,
      blankPrefix,
      renderSuffix,
      disabled,
      iconSize,
      activated,
      desc,
      inheritFont,
      style,
      displayCheckIcon,
      isUsingKiwiIcon,
      ...otherProps
    },
    ref
  ) => {
    const theme = useTheme() as Record<string, string>;
    const { alignMenuItems } = useMenuContext() || {};
    const classes = Styled.useMenuItemStyle({
      theme,
      $size: size,
      $hideIcon: hideIcon,
      $withSuffix: !!renderSuffix,
      $activated: activated,
      $alignMenuItems: alignMenuItems,
    });

    const renderIcon = () => {
      if (!icon) {
        return null;
      }

      if (isUsingKiwiIcon) {
        return <KiwiIcomoon type={icon} size="lg" />;
      }

      return <Icomoon style={style} className={icon} size={iconSize} />;
    };

    return (
      <MuiMenuItem {...otherProps} disabled={disabled} classes={classes} ref={ref}>
        {displayCheckIcon && <Icomoon className='md_tick' size={24} />}
        {renderIcon()}
        {svgIcon && <SvgElement content={svgIcon} width={24} height={24} />}
        {blankPrefix && <Styled.DummyPrefix />}
        <Styled.ListItemContentWrapper $withSuffix={!!renderSuffix}>
          <Styled.ListItemTitle $inheritFont={inheritFont}>
            <Styled.ListItemHeadline className="MenuItemHeadline">{children}</Styled.ListItemHeadline>
          </Styled.ListItemTitle>

          {desc && <Styled.ListItemDesc>{desc}</Styled.ListItemDesc>}
        </Styled.ListItemContentWrapper>
        {renderSuffix && (
          <Styled.SuffixWrapper>
            <Styled.SuffixContent>{renderSuffix({ disabled })}</Styled.SuffixContent>
          </Styled.SuffixWrapper>
        )}
      </MuiMenuItem>
    );
  }
);

MenuItem.defaultProps = {
  size: 'small',
  desc: '',
  icon: '',
  iconSize: 24,
  svgIcon: '',
  hideIcon: false,
  activated: false,
  blankPrefix: false,
  renderSuffix: null,
  disabled: false,
  inheritFont: false,
  style: {},
  displayCheckIcon: false,
  isUsingKiwiIcon: false,
};

export default MenuItem;
