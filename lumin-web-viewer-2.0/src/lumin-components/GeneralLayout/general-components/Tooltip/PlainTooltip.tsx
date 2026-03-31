/**
 * @link https://mui.com/material-ui/react-tooltip/
 */
import MaterialTooltip, { TooltipProps as BaseTooltipProps } from '@mui/material/Tooltip';
import { CSSProperties } from '@mui/styles';
import React, { forwardRef, useCallback } from 'react';
import { useTheme } from 'styled-components';

import * as Styled from './PlainTooltip.styled';

type TooltipStyle = CSSProperties;

export type TooltipProps = BaseTooltipProps & {
  title: React.ReactNode;
  shortcut?: string;
  children: React.ReactElement;
  tooltipStyle?: TooltipStyle;
  arrow?: boolean;
  noMaxWidth?: boolean;
  PopperProps?: Record<string, unknown>;
  location?: BaseTooltipProps['placement'];
  disableInteractive?: boolean;
};

/**
 * @deprecated please use PlainTooltip from kiwi-ui
 */
const PlainTooltip = forwardRef((props: TooltipProps, ref) => {
  const {
    children,
    tooltipStyle,
    title,
    arrow,
    noMaxWidth,
    shortcut,
    open: _open,
    location: placement,
    disableInteractive = true,
    ...otherProps
  } = props;
  const theme = useTheme();
  const classes = Styled.useStyles({
    tooltipStyle: {
      ...tooltipStyle,
      ...(noMaxWidth && { maxWidth: 'none' }),
    },
    theme,
  });

  const getTitle = useCallback(() => {
    if (!title) {
      return null;
    }
    if (title && shortcut) {
      return (
        <Styled.TooltipWrapper>
          <Styled.Title>{title}</Styled.Title>
          <Styled.Shortcut>{shortcut}</Styled.Shortcut>
        </Styled.TooltipWrapper>
      );
    }
    return <Styled.Title>{title}</Styled.Title>;
  }, [shortcut, title]);

  return (
    <MaterialTooltip
      disableInteractive={disableInteractive}
      ref={ref}
      title={getTitle()}
      classes={classes}
      arrow={arrow}
      placement={placement}
      {...otherProps}
    >
      {children}
    </MaterialTooltip>
  );
});

PlainTooltip.defaultProps = {
  tooltipStyle: {},
  arrow: false,
  noMaxWidth: false,
  shortcut: '',
  location: 'bottom',
};

export default PlainTooltip;
