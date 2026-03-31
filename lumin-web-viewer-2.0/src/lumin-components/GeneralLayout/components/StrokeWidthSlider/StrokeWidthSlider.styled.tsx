import styled from 'styled-components';

import { spacings } from 'constants/styles/editor';

export const SliderWrapper = styled.div`
  height: 32px;
  width: 100%;
`;

export const Row = styled.div`
  display: flex;
  flex-flow: row wrap;
  min-width: 0;
  align-items: center;
  gap: ${spacings.le_gap_2}px;
`;

export const Col = styled.div`
  display: block;
  color: ${({ theme }: { theme: Record<string, string> }) => theme.le_main_on_surface};
`;

export const InputCol = styled(Col)`
  .text-field-wrapper {
    max-width: 60px;
    input {
      padding-left: 0;
    }
  }
`;

export const SliderCol = styled(Col)`
  flex-grow: 1;
`;
