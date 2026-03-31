import styled from 'styled-components';

import { withStyles } from '@mui/styles';
import { MenuList, MenuItem } from '@mui/material';

import { Colors, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

const AVATAR_WIDTH = '48px';

export const ActionButtonWrapper = styled.div`
  ${mediaQuery.xl`
    opacity: 0;
    transition: opacity 0.25s ease;
  `}
`;

export const Container = styled.div`
  padding: 16px;
  border: 1px solid ${Colors.NEUTRAL_30};
  box-sizing: border-box;
  border-radius: var(--border-radius-primary);
  cursor: pointer;
  transition: all 0.25s ease;
  ${mediaQuery.md`
    padding: 16px 24px 24px;
  `}
  ${mediaQuery.xl`
    padding: 18px 24px 36px;
    &:hover {
      border: 1px solid ${Colors.PRIMARY_80};
      box-shadow: ${Shadows.SHADOW_XS};
      ${ActionButtonWrapper} {
        opacity: 1;
      }
    }
  `}
`;

export const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  ${mediaQuery.md`
    margin-bottom: 16px;
  `}
  ${mediaQuery.xl`
    margin-bottom: 18px;
  `}
`;

export const ItemContent = styled.div`
  display: grid;
  grid-template-columns: ${AVATAR_WIDTH} auto;
  gap: 3px 8px;
  align-items: center;
  ${mediaQuery.md`
    gap: 16px 12px;
  `}
  ${mediaQuery.xl`
    grid-template-columns: 1fr;
    gap: 12px;
    justify-items: center;
  `}
`;

export const TeamAvatarWrapper = styled.div`
  grid-row: 1 / 3;
  box-sizing: content-box;
  ${mediaQuery.md`
    grid-row: 1;
  `}
`;

export const TeamName = styled.span`
  margin-right: 10px;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  ${mediaQuery.xl`
    width: 100%;
    margin-right: 0;
    text-align: center;
  `}
`;

export const MemberAvatarWrapper = styled.div`
  display: flex;
  align-items: center;
  ${mediaQuery.md`
    grid-column: 1 / 3;
  `}
  ${mediaQuery.xl`
    grid-column: unset;
    margin-top: 4px;
  `}
`;

export const MemberAvatarItem = styled.div`
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

export const RemainingMemberNumber = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  line-height: 12px;
  color: ${Colors.NEUTRAL_60};
  ${mediaQuery.md`
    line-height: 16px;
  `}
`;

export const ActionTitle = styled.span`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
`;

export const CustomMenu = withStyles({
  root: {
    width: 230,
    boxSizing: 'border-box',
    padding: 0,
  },
})(MenuList);

export const ActionItem = withStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    gap: '8px',
    '&:hover': {
      background: Colors.NEUTRAL_10,
    },
    '& > i[class*=" icon-"]': {
      height: '24px',
      width: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }
  },
})(MenuItem);
