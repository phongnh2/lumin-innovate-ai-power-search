import { typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const ItemWrapper = styled.div`
  &[data-new-layout='true'] {
    margin-bottom: 16px;
  }
`;

export const Label = styled.label`
  ${typographies.le_title_small};
  color: ${({ theme }) => theme.le_main_on_surface};
  margin-bottom: 4px;
`;
