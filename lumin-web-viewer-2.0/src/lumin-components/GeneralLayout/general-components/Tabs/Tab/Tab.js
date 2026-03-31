/* eslint-disable arrow-body-style */
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { ThemeProvider, useTheme } from 'styled-components';

import Icomoon from 'luminComponents/Icomoon';

import * as Styled from './Tab.styled';

const Tab = React.forwardRef(({ variant, children, ...props }, ref) => {
  const { themeMode } = useTheme();
  const themeProvider = Styled.tabTheme[themeMode];

  const renderTab = useCallback(({ variant, children, ref, icon, ...props }) => {
    const content = (
      <Styled.ContentWrapper>
        {variant !== 'tertiary' && icon && <Icomoon className={icon} size={24} />}{' '}
        <Styled.Label>{children}</Styled.Label>
      </Styled.ContentWrapper>
    );

    switch (variant) {
      case 'primary':
        return (
          <Styled.PrimaryTab {...props} ref={ref} $variant={variant}>
            {content}
          </Styled.PrimaryTab>
        );

      case 'secondary':
        return (
          <Styled.SecondaryTab {...props} ref={ref} $variant={variant}>
            {content}
          </Styled.SecondaryTab>
        );

      case 'tertiary':
        return (
          <Styled.TertiaryTab {...props} ref={ref} $variant={variant}>
            {content}
          </Styled.TertiaryTab>
        );

      default:
        return null;
    }
  }, []);

  return <ThemeProvider theme={themeProvider}>{renderTab({ variant, children, ref, ...props })}</ThemeProvider>;
});

Tab.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'tertiary']),
  children: PropTypes.any,
};

Tab.defaultProps = {
  variant: 'primary',
  children: null,
};

export default Tab;
