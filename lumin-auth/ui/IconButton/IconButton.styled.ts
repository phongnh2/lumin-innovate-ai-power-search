import styled from '@emotion/styled';
import { isNumber } from 'lodash';

import { BorderRadius, Colors } from '../theme';

import BaseIconButton from './BaseIconButton';
import { TIconButtonProps } from './interfaces';

const getSize = ({ size }: Pick<TIconButtonProps, 'size'>) => (isNumber(size) ? `${size}px` : '44px');

export const IconButton = styled(BaseIconButton)`
  width: ${getSize};
  height: ${getSize};
  border-radius: ${BorderRadius.Primary};
  background-color: white;

  &.active {
    background-color: ${Colors.NEUTRAL_20};
  }

  &:hover {
    background-color: ${Colors.NEUTRAL_20};
  }
`;
