import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  padding-left: ${spacings.le_gap_1}px;
  padding-right: ${spacings.le_gap_1}px;
  align-items: center;
`;

export const LoadingContentWrapper = styled(Wrapper)`
  gap: ${spacings.le_gap_2}px;
  padding: 0px;
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_large }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;

export const Msg = styled.span`
  ${{ ...typographies.le_body_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;

export const LoadingContent = styled.span`
  ${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;
