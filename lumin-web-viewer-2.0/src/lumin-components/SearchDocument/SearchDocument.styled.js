import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
`;
export const Content = styled.div`
  min-width: 0;
  max-width: ${(props) => (props.$isCollapsed ? '0' : `calc(100% - ${props.$maxWidthInput}px)`)};
  transition: max-width 0.2s ease;
`;

export const FolderBadge = styled.div`
  --vertical-gap: 6px;
  flex-wrap: nowrap;
  display: flex;
  background: ${Colors.NEUTRAL_10};
  padding: 0 10px;
  height: calc(var(--input-height-medium) - var(--vertical-gap));
  border-radius: 6px;
  white-space: nowrap;
  align-items: center;
  margin-left: -10px;
`;

export const Input = styled.div`
  right: 0;
  position: relative;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  background: ${Colors.NEUTRAL_0};
  padding: 0;
  transition: width 0.2s ease;
  ${mediaQuery.md`
    width: ${(props) => (props.$isExpanded ? '100%' : `${props.$maxWidth}px`)};
  `}
  ${(props) => (props.$isDisabled && `
    pointer-events: none;
    opacity: .5;
  `)};
`;

export const FolderName = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 7px;
`;
