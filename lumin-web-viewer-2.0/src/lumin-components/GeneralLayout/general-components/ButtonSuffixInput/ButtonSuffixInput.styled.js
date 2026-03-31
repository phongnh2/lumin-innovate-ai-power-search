import styled, { css } from 'styled-components';
import { InputAdornment, OutlinedInput, TextField } from '@mui/material';
import { typographies } from 'constants/styles/editor';

const CommonStyle = css`
  ${({ theme }) =>`
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const Input = styled(OutlinedInput)`
  width: 68px;
  height: 32px;
  padding: 0 4px 0 8px;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 480;
  line-height: 135%;
  border-radius: var(--kiwi-border-radius-md);
  cursor: pointer;

  .MuiInputBase-input {
    padding: 0;
    cursor: inherit;
  }

  .MuiOutlinedInput-notchedOutline {
    border-color: transparent;
  }

  .MuiInputAdornment-positionEnd {
    margin: 0;
  }

  &:hover .MuiOutlinedInput-notchedOutline {
    border-color: transparent;
  }

  ${({ theme }) => `
    &.Mui-focused .MuiOutlinedInput-notchedOutline {
        border-width: 1px;
        border-color: ${theme.le_main_primary};
    }
    &.Mui-focused .MuiInputBase-input {
        cursor: text;
    }
    &:hover {
        background-color: ${theme.le_main_surface_container};
    }
    color: ${theme.le_main_on_surface_variant};
  `};

  &:hover:not(&.Mui-focused) {
    background: ${({ theme }) => theme.le_state_layer_on_surface_variant_hovered};
  }
  > input {
    ${{...typographies.le_label_medium}};
    ${CommonStyle}
  }

  div > i {
    ${CommonStyle}
  }
`;
