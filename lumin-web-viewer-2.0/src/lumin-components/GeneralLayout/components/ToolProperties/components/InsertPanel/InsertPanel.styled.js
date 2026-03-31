import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const BaseSection = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const Title = styled(BaseSection)`
  ${{ ...typographies.le_title_small }}
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
`}
`;

export const Wrapper = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2);
`;

export const MainContent = styled.div`
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
  margin: 0px ${spacings.le_gap_1 * -1}px;
  margin-bottom: ${spacings.le_gap_2}px;
  padding: ${spacings.le_gap_1}px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
`;

export const TotalPage = styled.span`
  --label-height: 20px;
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface};
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: calc(-1 * var(--label-height));
`;
export const InputWrapper = styled.div`
  display: flex;
  gap: ${spacings.le_gap_2}px;
  align-items: center;

  & .MuiInputBase-root {
    flex-grow: 1;
  }
`;
