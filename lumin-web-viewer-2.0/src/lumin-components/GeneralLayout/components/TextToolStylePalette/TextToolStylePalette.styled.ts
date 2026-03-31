import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const BtnsWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const Title = styled.div`
  flex-grow: 1;
  color: ${({ theme }) => theme.le_main_on_surface};
  ${{ ...typographies.le_title_small }};
`;
