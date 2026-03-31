import styled from 'styled-components';

import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  width: 360px;
  right: 0;
  position: relative;
  display: flex;
  justify-content: flex-end;
`;

export const Input = styled.div<{ $isExpanded: boolean; $maxWidth: number }>`
  width: 100%;
  background: ${Colors.NEUTRAL_0};
  padding: 0;
  transition: width 0.2s ease;
  ${mediaQuery.md<{ $isExpanded: boolean; $maxWidth: number }>`
    width: ${( props ) => (props.$isExpanded ? '100%' : `${props.$maxWidth}px`)};
  `}
`;

export const OrganizationName = styled.span`
  font-size: 12px;
  font-weight: 375;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 7px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CircleBadge = styled.div`
  --vertical-gap: 6px;
  flex-wrap: nowrap;
  display: flex;
  background: ${Colors.NEUTRAL_10};
  padding: 0 10px;
  height: calc(var(--input-height-medium) - var(--vertical-gap));
  border-radius: 6px;
  white-space: nowrap;
  align-items: center;
  margin-left: -12px;
  max-width: 164px;
  ${mediaQueryDown.sm`
    max-width: 98px;
  `}
`;

export const IconContainer = styled.div`
  width: 40px;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
  ${mediaQuery.md`
    height: 40px;
  `}
`;
