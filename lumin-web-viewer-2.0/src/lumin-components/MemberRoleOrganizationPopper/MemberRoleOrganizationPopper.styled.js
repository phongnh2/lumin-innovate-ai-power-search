import styled from 'styled-components';
import MenuList from '@mui/material/MenuList';

import MenuItem from 'lumin-components/Shared/MenuItem';

import { Colors, Fonts } from 'constants/styles';

export const Menu = styled(MenuList)`
  min-width: 240px;
  padding: 0;
`;

export const Item = styled(MenuItem)`
  height: 40px;
`;

export const Text = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 12px;
`;
