import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  overflow: hidden;
`;
export const TeamAvatar = styled.div`
  margin-left: 8px;
`;
export const TeamName = styled.h6`
  margin-left: 12px;
  font-size: 12px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  flex: 1;
  min-width: 0;
  line-height: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const SearchWrapper = styled.div`
  margin-bottom: 8px;
`;
export const UserContent = styled.div`
  flex: 1;
  line-height: 1;
  min-width: 0;
  overflow: hidden;
  margin-left: 12px;
`;
export const UserItem = styled.li`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-radius: var(--border-radius-primary);
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }

  &:not(:last-child) {
    margin-bottom: 8px;
  }
`;
export const UserEmail = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
export const UserName = styled(UserEmail)`
  font-size: 12px;
  color: ${Colors.NEUTRAL_100};
  line-height: 16px;
  font-weight: 600;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const Checked = styled.div`
  margin-left: 8px;
`;
export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 8px 0;
`;
export const NoResult = styled.h6`
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  height: 64px;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
