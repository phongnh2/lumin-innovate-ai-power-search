import styled from 'styled-components';
import { withStyles } from '@mui/styles';
import { MenuList } from '@mui/material';
import Divider from '@mui/material/Divider';

import MenuItem from 'lumin-components/Shared/MenuItem';
import { Colors } from 'constants/styles';

export const CustomMenu = withStyles({
  root: {
    width: 260,
  },
})(MenuList);

export const CustomActionItem = styled(MenuItem)`
  display: flex;
  justify-content: space-between;
`;

export const ActionText = styled.span`
  font-weight: 400;
  font-size: 14px;
  color: ${Colors.NEUTRAL_80};
  margin: ${({ $isOfflineAction }) => ($isOfflineAction ? '0 6px 0' : '0 12px 0')};
  line-height: 1;
`;

export const CustomDivider = styled(Divider)`
  margin: 8px 16px;
  background-color: var(--color-neutral-20);
`;
