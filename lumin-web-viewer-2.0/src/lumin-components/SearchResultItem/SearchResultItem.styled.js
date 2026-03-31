import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const StyledItemWrapper = styled.div`
  cursor: ${(props) => props.disabled && 'not-allowed'};
`;

export const StyledRowWrapper = styled.div`
  padding: 0 16px;
  height: 48px;
  display: flex;
  align-items: center;
  background: ${(props) => props.selected && Colors.NEUTRAL_20};
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  transition: background 0.25s ease;
  cursor: ${(props) => props.disabled ? 'not-allowed' : 'pointer'};
  &:hover {
    background: ${(props) => (!props.noResults && !props.selected && props.theme.pendingUserHover) || Colors.NEUTRAL_10};
    ${({ noResults }) => noResults && `
      cursor: default;
    `}
  }

  ${mediaQuery.md`
    height: 64px;
    padding: 0 16px;
  `}
`;

export const StyledText = styled.p`
  font-weight: ${(props) => props.fontWeight || 600};
  font-stretch: normal;
  font-style: ${(props) => (props.italic ? 'italic' : 'normal')} ;
  line-height: 16px;
  letter-spacing: 0.34px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${(props) => props.color || Colors.NEUTRAL_100};
  font-size: 12px;
  margin-bottom: 2px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 4px;
  `};
`;

export const StyledTextLight = styled(StyledText)`
  color: ${(props) => props.theme.subTitle || Colors.NEUTRAL_80};
  font-weight: 400;
  margin-bottom: 0;
`;

export const StyledRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
`;

export const StyledAvatar = styled.div`
  flex-shrink: 0;
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

export const StyledInfo = styled.div`
  width: calc(100% - 44px);
  overflow: hidden;
  padding-right: 8px;
`;

export const StyledEmail = styled(StyledTextLight)`
  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
  `}
`;

export const StyledRightSectionText = styled(StyledText)`
  color: ${Colors.SECONDARY_50};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  font-weight: 400;
`;
