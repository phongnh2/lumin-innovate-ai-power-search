import styled from '@emotion/styled';
import { Dialog as MuiDialog } from '@mui/material';

import { Text } from '../Text';
import { BorderRadius } from '../theme';
import { Breakpoints } from '../utils';

import { DialogProps } from './interfaces';

export const Dialog = styled(MuiDialog)<DialogProps>(({ size }) => ({
  '.MuiPaper-root': {
    padding: '16px',
    width: size,
    borderRadius: BorderRadius.Primary,
    [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
      padding: '24px'
    }
  }
}));

export const Title = styled(Text)({
  fontWeight: 600
});

export const ConfirmTitleWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
});

export const ConfirmTitle = styled(Text)({
  marginTop: 16,
  marginBottom: 8,
  fontWeight: 600
});

export const Footer = styled('div')<{ column: number }>(({ column }) => {
  const oneColumn = column === 1;
  return {
    display: oneColumn ? 'flex' : 'grid',
    ...(oneColumn && { justifyContent: 'center' }),
    ...(!oneColumn && { gridTemplateColumns: '1fr 1fr', gap: 16 }),
    width: '100%',
    marginTop: '16px',
    [`@media screen and (min-width: ${Breakpoints.md}px)`]: {
      marginTop: '24px'
    }
  };
});
