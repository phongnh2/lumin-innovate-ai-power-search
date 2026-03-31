import styled from '@emotion/styled';

import { Colors } from '../../theme';
import IconButton from '../IconButton';

export const DropboxIcon = styled(IconButton)`
  background-color: ${Colors.NEUTRAL_10};
`;

export const AppleIcon = styled(IconButton)`
  background-color: ${Colors.NEUTRAL_100};
  &:hover {
    background-color: ${Colors.NEUTRAL_80};
  }
`;
