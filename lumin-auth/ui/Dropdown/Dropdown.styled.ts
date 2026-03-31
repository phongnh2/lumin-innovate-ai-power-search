import styled from '@emotion/styled';
import { Popper as MuiPopper } from '@mui/material';

import { BorderRadius, Colors } from '../theme';

export const Popper = styled(MuiPopper)({
  zIndex: 'var(--zindex-popover)'
});

export const ChildrenContainer = styled('div')<{ verticalGap: boolean }>(({ verticalGap }) => ({
  background: 'white',
  padding: `4px ${verticalGap ? '8px' : 0}`,
  marginTop: '4px',
  borderRadius: BorderRadius.Primary,
  border: `1px solid ${Colors.NEUTRAL_20}`
}));

interface TriggerWrapperProps {
  disabled?: boolean;
}

export const TriggerWrapper = styled('div')<TriggerWrapperProps>(({ disabled }) => ({
  cursor: disabled ? 'not-allowed' : 'pointer',
  width: 'fit-content',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flex: '0 0 auto',
  opacity: disabled ? 0.6 : 1,
  pointerEvents: disabled ? 'none' : 'auto'
}));
