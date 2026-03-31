
import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const HeaderContainer = styled.div`
  border-bottom: var(--border-secondary);
  padding: 8px 16px;
  ${mediaQuery.md`
    padding: 16px 24px 8px 24px;
  `}
`;

export const HeaderContainerReskin = styled.div`
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-3);
  display: flex;
	align-items: center;
	justify-content: space-between;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const HeaderContent = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  height: 36px;
  ${mediaQuery.md`
    height: 40px;
  `}
`;

export const HeaderContentReskin = styled.div`
  display: flex;
  gap: var(--kiwi-spacing-0-5);
  align-items: center;
  color: var(--kiwi-colors-surface-on-surface);
`;

export const HeaderText = styled.h2`
  font-style: normal;
  font-weight: 600;
  color: ${({ theme }) => theme.title || Colors.NEUTRAL_100};
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--color-neutral-20);
  display: block;
`;

export const TargetWrapper = styled.div`
  display: flex;
`;

export const TextWrapper = styled.div`
  margin-left: 8px;
`;

export const Action = styled.p`
  font-size: 10px;
  line-height: 12px;
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
`;

export const Target = styled.h5`
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_80};
`;

export const Back = styled.div`
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
`;