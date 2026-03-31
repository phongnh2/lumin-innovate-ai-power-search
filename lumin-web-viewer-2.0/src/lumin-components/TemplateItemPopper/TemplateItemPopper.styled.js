import styled from 'styled-components';
import { MenuList as MuiMenuList } from '@mui/material';

export const MenuList = styled(MuiMenuList)`
  width: 230px;
  padding: 0;
`;
export const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: min-content 1fr;
  column-gap: 12px;
  align-items: center;
`;
