import styled from 'styled-components';
import { Fab } from '@mui/material';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Button = styled(ButtonMaterial)`
  display: none;

  ${mediaQuery.md`
    display: inline-flex;
  `}
`;

export const TextButton = styled.span`
  margin-left: 8px;
`;

export const FAB = styled(Fab)`
  width: 64px;
  height: 64px;
  position: fixed;
  right: 16px;
  bottom: 16px;
  background-color: ${Colors.SECONDARY_50};
  box-shadow: var(--shadow-m);
  z-index: 1;

  &:hover {
    background-color: ${Colors.SECONDARY_60};
  }

  ${mediaQuery.md`
    display: none;
  `}
`;
