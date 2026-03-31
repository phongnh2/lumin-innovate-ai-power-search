import styled from 'styled-components';
import { typographies, spacings } from 'constants/styles/editor';
import { typographies as kiwiTypographies } from 'lumin-ui/tokens';
import Icomoon from 'lumin-components/Icomoon';

type ContentContainerProps = {
  isSelected: boolean;
  isReply: boolean;
}

type HightLightContentProps = {
  shouldShowHighlightArrow: boolean;
  isShowFullHighlight: boolean;
}

export const ContentContainer = styled.div<ContentContainerProps>`
  padding: 0 ${spacings.le_gap_2}px;
  transition: transform 225ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  width: 100%;
`;

export const ReplyContainer = styled.div`
  ${{...typographies.le_body_medium}};

  ${({theme }) => `
    color: ${theme.le_main_on_surface};
    p.reopened, p.commentStatus{
      color: ${theme.le_main_on_surface_variant};
    }
  `}
`;

export const HightLightWrapper = styled.div`
  border-radius: 8px;
  padding: ${spacings.le_gap_0_5}px;
  margin:  ${spacings.le_gap_1}px 0;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  ${({ theme }) => `
    background-color: ${theme.kiwi_colors_core_secondary_container};
  `}
`;

export const HightLightContent = styled.span<HightLightContentProps>`
  ${kiwiTypographies.kiwi_typography_body_sm};
  overflow: visible;
  ${({ isShowFullHighlight }) => `
    white-space: ${isShowFullHighlight ? 'break-spaces' : 'nowrap'};
  `}
  ${({ shouldShowHighlightArrow, isShowFullHighlight, theme }) => `
    color: ${theme.kiwi_colors_core_on_secondary_container};
    ${shouldShowHighlightArrow && !isShowFullHighlight && `
      overflow: hidden;
      text-overflow: ellipsis;
      overflow: hidden;
    `}
  `}
`;

export const ArrowIcon = styled(Icomoon) `
  margin-left: ${spacings.le_gap_0_5}px;
`
