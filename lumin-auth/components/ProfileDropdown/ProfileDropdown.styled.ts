import styled from '@emotion/styled';

import { Colors, DialogSize, Text } from '@/ui';

export const Container = styled.div({
  maxWidth: DialogSize.SM,
  minWidth: '300px'
});

export const AvatarContainer = styled.div({
  padding: '20px 24px 24px',
  marginBottom: '8px',
  display: 'flex',
  position: 'relative',
  '&:after': {
    display: 'block',
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 24px * 2)',
    borderBottom: `1px solid ${Colors.NEUTRAL_20}`
  }
});

export const InfoContainer = styled.div({
  marginLeft: '16px',
  flex: '1 1 auto',
  minWidth: 0,
  wordWrap: 'break-word'
});

export const Name = styled(Text)({
  marginBottom: '4px'
});

export const Email = styled(Text)({});
