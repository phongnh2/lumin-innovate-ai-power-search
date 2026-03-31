import styled from '@emotion/styled';
import { MenuItem as MuiMenuItem } from '@mui/material';

import { Colors } from '../theme';
import { Fonts } from '../utils/font.enum';

export const Menu = styled.ul({
  padding: 0,
  margin: 0,
  listStyle: 'none'
});

export const MenuItem = styled(MuiMenuItem)<{ component?: any; href?: string }>({
  fontFamily: Fonts.Primary,
  margin: '0px',
  padding: '10px 24px',
  transition: '0.25s ease all',
  '&:hover': {
    background: Colors.NEUTRAL_10
  }
});

export const IconWrapper = styled.div({
  marginRight: '8px',
  display: 'inline-flex',
  alignItems: 'center',
  width: '16px'
});
