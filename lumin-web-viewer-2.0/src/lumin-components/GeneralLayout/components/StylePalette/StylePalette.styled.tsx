import styled from 'styled-components';

import { spacings } from 'constants/styles/editor';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_2}px;
  padding: ${spacings.le_gap_2}px;
`;
