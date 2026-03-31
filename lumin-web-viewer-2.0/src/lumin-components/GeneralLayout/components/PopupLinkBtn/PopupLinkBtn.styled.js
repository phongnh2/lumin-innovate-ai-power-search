import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

const BaseWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_2}px;
`;

export const TabsWrapper = styled(BaseWrapper)``;

export const InputWrapper = styled(BaseWrapper)``;

export const Label = styled.div`
  ${{ ...typographies.le_body_small }}
  color:${({ theme }) => theme.le_main_on_surface};
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const BtnsWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
  justify-content: flex-end;
`;
