import { typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Container = styled.div`
  &[data-new-layout='true'] {
    margin-bottom: 12px;
  }
`;

export const AuthorSection = styled.div`
  &[data-new-layout='true'] {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }
`;

export const Label = styled.label`
  &[data-new-layout='true'] {
    ${typographies.le_title_small};
    color: ${({ theme }) => theme.le_main_on_surface};
  }
`;
