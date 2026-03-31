import styled from 'styled-components';

import SharedTabs from 'lumin-components/Shared/Tabs';
import { Colors, Fonts, Shadows } from 'constants/styles';

export const Container = styled.div`
  border: 1px solid ${Colors.NEUTRAL_20};
  box-shadow: ${Shadows.SHADOW_XS};
  border-radius: var(--border-radius-primary);
`;

export const HeaderContainer = styled.div`
  padding: 0px 16px;
`

export const Tabs = styled(SharedTabs)`
  display: inline-flex;
`;

export const Divider = styled.div<{$empty?: boolean}>`
  width: 100%;
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  display: block;
  ${({ $empty }) => $empty && `
    display: none;
  `}
`;

export const ResultList = styled.div`
  padding: 4px 0px 0px 0px;
`;

export const ResultItem = styled.div<{ isActive?: boolean }>`
  display: grid;
  grid-template-columns: min-content minmax(0, 1fr);
  column-gap: 8px;
  align-items: center;
  height: 44px;
  padding: 0 24px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  position: relative;
  background-color: ${({ isActive }) => (isActive ? Colors.PRIMARY_20 : 'none')};
  &:before {
    content: '';
    display: block;
    height: 100%;
    width: 4px;
    position: absolute;
    top: 0;
    left: -2px;
  }

  &:hover {
    background-color: ${Colors.PRIMARY_20};
  }
`;


export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_60};
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-transform: none;
`;

export const Title = styled(Text)<{ hasPadding?: boolean }>`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  padding: ${(props) => props.hasPadding && '0 16px'};
  box-sizing: border-box;
  margin-top: 0px;
`;

export const IconContainer = styled.div`
`;

export const IconFolder = styled.img`
  width: 24px;
`;
