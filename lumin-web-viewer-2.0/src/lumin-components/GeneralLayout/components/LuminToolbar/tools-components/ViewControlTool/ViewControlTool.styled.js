import { typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  grid-gap: 8px 16px;
  padding: 16px;
  border-radius: 16px;
`;

export const Title = styled.div`
  align-self: center;
  ${{ ...typographies.le_body_medium }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
`;
