import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const HeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
`;

export const Title = styled.div`
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
  `}
  ${{ ...typographies.le_title_small }};
`;

export const BtnsWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-gap: 8px;
`;

export const Wrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_2}px;
  flex-direction: column;
`;
