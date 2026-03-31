import styled from 'styled-components';

import MultilingualButton from 'lumin-components/MultilingualButton';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  width: 100%;
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  background: ${Colors.WHITE};
  border: var(--border-secondary);
  border-radius: var(--border-radius-primary);

  ${mediaQuery.md`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  `}
`;

export const Content = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  ${mediaQuery.md`
    width: calc(100% - 126px);
  `}
`;

export const Info = styled.div`
  width: calc(100% - 56px - 12px);
  margin-left: 12px;
`;

export const Name = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const OrgName = styled.p`
  max-width: calc(100% - 32px);
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;

  ${mediaQuery.md`
    max-width: calc(100% - 48px);
  `}
`;

export const Chip = styled.div`
  width: 24px;
  max-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  padding: 5px;
  border-radius: var(--border-radius-dense);
  background-color: ${Colors.WARNING_10};
`;

export const MemberAvatarGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 4px;
`;

export const MemberAvatar = styled.div`
  margin-left: -6px;
  &:first-child {
    margin-left: -2px;
  }
  ${mediaQuery.md`
    margin-left: -8px;
  `}
  ${mediaQuery.xl`
    &:first-child {
      margin-left: 0;
    }
  `}
`;

export const Button = styled(MultilingualButton)`
  width: 100%;
  margin-top: 16px;
  ${mediaQuery.md`
    max-width: 126px;
    margin-top: 0;
  `}
`;
