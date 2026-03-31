import { Colors, Shadows } from 'constants/styles';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Item = styled.div`
  position: relative;
`;

export const Icon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $active }) => ($active ? Colors.SUCCESS_50 : Colors.WHITE)};
  border-radius: 50%;
  box-shadow: ${Shadows.SHADOW_S};

  ${mediaQuery.md`
    width: 40px;
    height: 40px;
  `}
`;

export const Text = styled.p`
  width: max-content;
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
`;

export const Divider = styled.div`
  width: 100%;
  height: 2px;
  margin: 0 12px;
  border-radius: 1px;
  background-color: ${Colors.NEUTRAL_20};

  &:nth-child(2) {
    background-color: ${({ $step }) => ($step === 1 ? Colors.NEUTRAL_20 : Colors.SUCCESS_50)};
  }

  &:nth-child(4) {
    background-color: ${({ $step }) => (($step === 2 || $step === 1) ? Colors.NEUTRAL_20 : Colors.SUCCESS_50)};
  }

  &:last-child {
    display: none;
  }
`;
