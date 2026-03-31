import styled, { css } from 'styled-components';
import { typographies } from 'constants/styles/editor';
import FormControlLabel from '@mui/material/FormControlLabel';
import { BorderRadius } from 'constants/styles';
import { spacings } from 'constants/styles/editor';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;

  ${({ $isSearchPanelOpen }) => !$isSearchPanelOpen && css`
    position: absolute;
    bottom: -52px;
    right: 10px;
    z-index: 100;
  `}
`;

export const QuickSearch = styled.div`
  width: 400px;
  border-radius: ${BorderRadius.PRIMARY};
  padding: ${spacings.le_gap_1}px;
  box-shadow: 0px 1px 3px 1px rgba(0, 0, 0, 0.15), 0px 1px 2px 0px rgba(0, 0, 0, 0.30);

  ${({ $isSearchPanelOpen, theme }) => $isSearchPanelOpen && `
    width: auto;
    padding: 0 ${spacings.le_gap_1_5}px;
    box-shadow: unset;
    display: flex;
    align-items: center;
    border: 1px solid ${theme.le_main_outline_variant} !important;
    margin: ${spacings.le_gap_0_5}px ${spacings.le_gap_1_5}px;
  `}

  ${({ theme, $isSearchPanelOpen }) => `
    background-color: ${$isSearchPanelOpen ? 'transparent' : theme.le_main_surface_container_low };
    & fieldset {
      border: ${$isSearchPanelOpen ? 'none' : `1px solid ${theme.le_main_outline_variant}`} !important;
    }

    &:focus-within {
      & fieldset{
        border-color: ${theme.le_main_outline_variant} !important;
      }
    }
  `}
`;

export const FormControlLabelWrapper = styled(FormControlLabel)`
  & span {
    ${({...typographies.le_label_medium})};
  }
  margin: 0;
  display: flex;
  gap: 2px;
`

export const CheckBoxWrapper = styled.div`
  height: 32px;
  display: flex;
  gap: 24px;
  margin: 0 ${spacings.le_gap_1}px ${spacings.le_gap_0_5}px ${spacings.le_gap_1}px;

  & label {
    flex: 1;
  }

  > * {
    ${({ theme }) => `
      color: ${theme.le_main_on_surface_variant};
    `}
  }
`;
