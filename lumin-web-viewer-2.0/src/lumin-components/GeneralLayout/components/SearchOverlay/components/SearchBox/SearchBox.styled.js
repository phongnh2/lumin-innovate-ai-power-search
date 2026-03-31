import styled from 'styled-components';

import TextField from '@new-ui/general-components/TextField';

import { typographies, spacings } from 'constants/styles/editor';

export const Container = styled.div`
  width: 100%;
  border-radius: var(--border-radius-primary);
  align-items: center;
  display: flex;
  gap: ${spacings.le_gap_1}px;
  background: ${({ theme }) => theme.background};
`;

export const InputSection = styled.div`
  width: 100%;
  height: 100%;
  > :first-child {
    width: 100%;
  }
`;

export const TextInput = styled(TextField)`
  width: 100% !important;
  padding: ${spacings.le_gap_0_5}px;
  box-shadow: none;
  background-color: transparent;
  &&[data-search-panel-open='true'] {
    padding: 0;
    ${typographies.le_body_medium};
    border: none;
    &:hover {
      background-color: transparent;
    }
  }

  & .icon {
    color: ${({ theme }) => theme.le_main_on_surface_variant} !important;
  }
`;

export const ActionSection = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const ResultsCount = styled.div`
  display: flex;
  gap: 8px;
  white-space: nowrap;
  align-items: center;
  user-select: 'none';

  span {
    ${{ ...typographies.le_body_medium }};
  }

  ${({ theme, $disabled }) =>
    `
    color: ${theme.le_main_on_surface_variant};
    opacity: ${$disabled ? '0.38' : '1'}; 
  `}
`;

export const Divider = styled.div`
  width: 1px;
  height: 16px;
  background-color: ${({ theme }) => theme.le_main_on_surface_variant};
`;
