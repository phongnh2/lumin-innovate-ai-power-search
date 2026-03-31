import styled from '@emotion/styled';

import { BorderRadius, Colors } from '@/ui';

export const LogoWrapper = styled.div<{ borderColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${BorderRadius.Primary};
  margin-right: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 1px;
  background: ${({ borderColor }) => borderColor || Colors.NEUTRAL_20};

  &::before {
    content: '';
    position: absolute;
    inset: 1px;
    background: white;
    border-radius: calc(${BorderRadius.Primary} - 1px);
  }

  > svg,
  > img {
    position: relative;
    z-index: 1;
    width: 24px;
    height: 24px;
  }
`;
