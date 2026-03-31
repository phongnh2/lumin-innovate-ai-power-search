import styled from '@emotion/styled';

import { Colors, mediaQueryUp } from '@/ui';

export const Container = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
  ${mediaQueryUp.md} {
    margin: 24px 0 16px;
  }
`;

export const Text = styled.span`
  display: inline-block;
  font-size: 14px;
  line-height: 16px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_60};
  position: relative;

  --divider-gap: 24px;
  --divider-width: 75px;

  ${mediaQueryUp.md} {
    line-height: 20px;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: var(--divider-width);
    height: 1px;
    background-color: ${Colors.NEUTRAL_20};
    z-index: 1;
    left: calc(100% + var(--divider-gap));
  }

  &::before {
    left: calc(-1 * var(--divider-width) - var(--divider-gap));
  }
`;
