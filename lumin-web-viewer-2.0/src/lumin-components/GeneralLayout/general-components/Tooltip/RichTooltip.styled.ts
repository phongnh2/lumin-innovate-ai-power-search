import styled from 'styled-components';

import { makeStyles, CSSProperties } from '@mui/styles';

import { le_body_small, le_title_small } from 'constants/styles/editor/typographies';
import { boxShadows } from 'lumin-ui/tokens';

type TooltipStyle = CSSProperties;

type MakeStyleProps = { theme: any; tooltipStyle: TooltipStyle };

export const useStyles = makeStyles<any, MakeStyleProps>({
  tooltip: ({ tooltipStyle, theme }) => ({
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    ...tooltipStyle,
  }),
});

export const TooltipWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  ${({ theme }) =>
  `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const Title = styled.div`
  ${({...le_title_small})};
`;

export const Content = styled.div`
  ${({...le_body_small})};
`;

export const LearnMoreContent = styled.div`
  min-width: 64px;
  min-height: 32px;
  display: flex;
  ${({ theme }) =>
  `
    color: ${theme.le_main_primary};
  `}
`;