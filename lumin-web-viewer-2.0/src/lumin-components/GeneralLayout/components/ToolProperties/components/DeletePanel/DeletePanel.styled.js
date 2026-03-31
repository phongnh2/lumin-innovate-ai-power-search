import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const Wrapper = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2);
`;

export const MainContent = styled.div`
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
  margin: 0px ${spacings.le_gap_1 * -1}px;
  margin-bottom: ${spacings.le_gap_2}px;
  padding: ${spacings.le_gap_1}px;
  border-radius: 8px;
`;

export const Desc = styled.div`
  ${{ ...typographies.le_body_small }}
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
`}
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const ModalContent = styled.span`
  ${typographies.le_body_medium}
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
`}
`;

export const Hightlight = styled.span`
  ${typographies.le_title_small}

  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
`}
`;
