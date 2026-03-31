import ButtonBase from '@mui/material/ButtonBase';
import styled from 'styled-components';
import { spacings, typographies } from 'constants/styles/editor';

export const CreateBtn = styled(ButtonBase)`
  border: 1px dashed ${({ theme }) => theme.le_main_outline};
  color: ${({ theme }) => theme.le_main_on_surface_variant};
  height: 48px;
  padding: 0px;
  border-radius: 8px;
  width: 100%;
  ${{ ...typographies.le_label_large }}

  > i {
    margin-right: ${spacings.le_gap_0_5}px;
  }
`;
