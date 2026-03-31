/**
 * @link https://v4.mui.com/components/tooltips/#tooltip
 */
import MaterialTooltip, { TooltipProps } from '@mui/material/Tooltip';
import { makeStyles, CSSProperties } from '@mui/styles';
import React from 'react';

import { useThemeMode } from 'hooks/useThemeMode';
import { useViewerMatch } from 'hooks/useViewerMatch';

import { THEME_MODE } from 'constants/lumin-common';
import { Fonts, DarkTheme, LightTheme } from 'constants/styles';

type TooltipStyle = CSSProperties;
type TooltipArrowStyle = CSSProperties;

type Props = {
  title: string | JSX.Element | boolean;
  children: React.ReactElement;
  tooltipStyle?: TooltipStyle;
  tooltipArrowStyle?: TooltipArrowStyle;
  disableInteractive?: boolean;
  arrow?: boolean;
  noMaxWidth?: boolean;
  PopperProps?: Record<string, unknown>;
};

type MakeStyleProps = {
  tooltipStyle?: TooltipStyle;
  tooltipArrowStyle?: TooltipArrowStyle;
  themeColor: Record<string, string>;
};

const useStyles = makeStyles<any, MakeStyleProps>({
  tooltip: ({ tooltipStyle, themeColor }) => ({
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 500,
    fontFamily: Fonts.PRIMARY,
    lineHeight: '16px',
    background: themeColor.TOOLTIP_BG,
    color: themeColor.TOOLTIP_TEXT,
    padding: 8,
    display: 'flex',
    alignItems: 'center',
    ...tooltipStyle,
  }),
  arrow: ({ tooltipArrowStyle, themeColor }) => ({
    color: themeColor.TOOLTIP_BG,
    ...tooltipArrowStyle,
  }),
});

const Tooltip = React.forwardRef((props: Props & TooltipProps, ref) => {
  const {
    children,
    tooltipStyle,
    tooltipArrowStyle,
    title,
    arrow,
    noMaxWidth,
    disableInteractive = true,
    ...otherProps
  } = props;
  const { isViewer } = useViewerMatch();
  const themeMode = useThemeMode();
  const isLightMode = themeMode === THEME_MODE.LIGHT || !isViewer;
  const themeColor = (isLightMode ? LightTheme : DarkTheme) as unknown as Record<string, string>;
  const classes = useStyles({
    tooltipStyle: {
      ...tooltipStyle,
      whiteSpace: 'normal',
      wordBreak: 'break-word',
      ...(noMaxWidth && { maxWidth: 'none' }),
    },
    tooltipArrowStyle,
    themeColor,
  });

  if (!title) {
    return children;
  }
  return (
    <MaterialTooltip
      ref={ref}
      title={title}
      classes={classes}
      arrow={arrow}
      disableInteractive={disableInteractive}
      {...otherProps}
    >
      {children}
    </MaterialTooltip>
  );
});

Tooltip.defaultProps = {
  tooltipStyle: {},
  tooltipArrowStyle: {},
  arrow: false,
  noMaxWidth: false,
  PopperProps: {},
};

export default Tooltip;
