/**
 * @link https://v4.mui.com/components/tooltips/#tooltip
 */
import MaterialTooltip, { TooltipProps } from '@mui/material/Tooltip';
import { CSSProperties } from '@mui/styles';
import { merge } from 'lodash';
import React, { forwardRef } from 'react';
import { useTheme } from 'styled-components';

import Paper from '../Paper';

import * as Styled from './RichTooltip.styled';

type TooltipStyle = CSSProperties;

type Props = {
  title: string | JSX.Element | boolean;
  content?: string | JSX.Element;
  detail?: string | JSX.Element;
  children: React.ReactElement;
  tooltipStyle?: TooltipStyle;
  arrow?: boolean;
  noMaxWidth?: boolean;
  PopperProps?: Record<string, unknown>;
  slotProps?: Record<string, unknown>;
};

const RichTooltip = forwardRef((props: Props & TooltipProps, ref) => {
  const { children, tooltipStyle, title, arrow, noMaxWidth, content, detail, slotProps, ...otherProps } = props;
  const theme = useTheme();
  const classes = Styled.useStyles({
    tooltipStyle: {
      ...tooltipStyle,
      ...(noMaxWidth && { maxWidth: 'none' }),
    },
    theme,
  });

  const mergedSlotProps = merge(
    {},
    {
      popper: {
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ],
      },
    },
    slotProps
  );

  if (!title) {
    return children;
  }

  const renderContent = (): JSX.Element => (
    <Styled.TooltipWrapper>
      <Styled.ContentWrapper>
        <Styled.Title>{title}</Styled.Title>
        <Styled.Content>{content}</Styled.Content>
      </Styled.ContentWrapper>
      {detail && <Styled.LearnMoreContent>{detail}</Styled.LearnMoreContent>}
    </Styled.TooltipWrapper>
  );

  return (
    <MaterialTooltip
      slots={{
        tooltip: Paper,
      }}
      slotProps={mergedSlotProps}
      ref={ref}
      title={renderContent()}
      classes={classes}
      arrow={arrow}
      {...otherProps}
    >
      {children}
    </MaterialTooltip>
  );
});

RichTooltip.defaultProps = {
  tooltipStyle: {},
  arrow: false,
  noMaxWidth: false,
  PopperProps: {},
  content: '',
  detail: '',
};

export default RichTooltip;
