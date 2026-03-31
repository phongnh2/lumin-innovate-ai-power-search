import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Title = styled.h2`
  ${typographies.le_title_medium};
  color: ${({ theme }) => theme.le_main_on_surface};
  margin-bottom: ${spacings.le_gap_2}px;
`;

export const ContentFooter = styled.div`
  &[data-new-layout='true'] {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
`;
