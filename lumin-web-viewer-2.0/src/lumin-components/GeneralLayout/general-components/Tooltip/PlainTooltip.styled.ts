import styled from 'styled-components';

import { makeStyles, CSSProperties } from '@mui/styles';

import { le_body_small } from 'constants/styles/editor/typographies';

type TooltipStyle = CSSProperties;

type MakeStyleProps = { theme: any; tooltipStyle: TooltipStyle };

export const useStyles = makeStyles<any, MakeStyleProps>({
  tooltip: ({ tooltipStyle, theme }) => ({
    borderRadius: 8,
    ...le_body_small,
    background: theme.le_main_inverse_surface,
    color: theme.le_main_inverse_on_surface,
    padding: '4px 8px',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    maxWidth: '200px',
    ...tooltipStyle,
  }),
});

export const TooltipWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

export const Title = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;

  /* stylelint-disable-next-line value-no-vendor-prefix */
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  white-space: normal;
`;

export const Shortcut = styled.span`
  padding-left: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;