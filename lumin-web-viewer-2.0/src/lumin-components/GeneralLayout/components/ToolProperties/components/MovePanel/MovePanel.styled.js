import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const Wrapper = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2);
`;

export const Content = styled.div`
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
  margin: 0px ${spacings.le_gap_1 * -1}px;
  padding: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_2}px;
  border-radius: 8px;
`;

export const MainContent = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_0_25}px;
`;

export const Label = styled.span`
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;
