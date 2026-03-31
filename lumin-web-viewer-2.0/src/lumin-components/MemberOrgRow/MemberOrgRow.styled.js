import styled, { css } from 'styled-components';
import { Grid, MenuList } from '@mui/material';

import SharedMenuItem from 'lumin-components/Shared/MenuItem';
import SharedPopperButton from 'lumin-components/PopperButton';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { ORGANIZATION_ROLES } from 'constants/organizationConstants';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled(Grid)`
  width: 100%;
  display: flex;
  padding: 0;
  height: 80px;
  border-bottom: var(--border-secondary);

  ${({ $disabled }) => $disabled && `
    opacity: 0.6;
    pointer-events: none;
  `}

  ${mediaQuery.md`
    height: 64px;
  `}
`;

export const Item = styled(Grid)`
  display: flex;
  flex-direction: row;
  align-items: center;

  ${({ $hideInMobile }) => $hideInMobile && `
    display: none;
  `}
  ${({ $makeRole }) => $makeRole && `
    max-width: 4%;
    flex-basis: 4%;
  `}
  ${({ $dateJoined }) => $dateJoined && `
    max-width: 20%;
    flex-basis: 20%;
  `};
  ${mediaQuery.md`
    ${({ $hideInMobile }) => $hideInMobile && `
      display: flex;
    `}
  `}
`;

export const IdentityWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  padding: 0 12px;
  width: calc(100% - 32px);
  overflow: hidden;
  white-space: nowrap;
`;

export const Identity = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  overflow: hidden;
  text-overflow: ellipsis;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const CurrentUserLabel = styled.label`
  color: ${Colors.NEUTRAL_100};
`;

export const Role = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 4px;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
    margin-top: 0;

    ${({ $hideInTabletUp }) => $hideInTabletUp && `
      display: none;
    `}
  `}

  ${({ $role }) => $role === ORGANIZATION_ROLES.ORGANIZATION_ADMIN && `
    color: ${Colors.SECONDARY_50}
  `}

  ${({ $role }) => $role === ORGANIZATION_ROLES.BILLING_MODERATOR && `
    color: ${Colors.PRIMARY_80}
  `}
`;

export const Email = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${(props) => (props.$darker ? Colors.NEUTRAL_100 : Colors.NEUTRAL_80)};
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ $hideInMobile }) => $hideInMobile && `
    display: none;
  `}

  ${mediaQuery.md`
    margin-top: 0;
    ${({ $hideInTabletUp }) => $hideInTabletUp && `
      display: none;
    `}

    ${({ $hideInMobile }) => $hideInMobile && `
      display: block;
    `}
  `}
`;

export const Date = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${mediaQuery.md`
    font-size: 12px;
    line-height: 16px;
    margin-top: 0;

    ${({ $hideInTabletUp }) => $hideInTabletUp && css`
      display: none;
    `}
  `}
`;

export const ButtonWrapper = styled.div`
  display: flex;
`;

const ButtonRejectAccept = styled(ButtonMaterial)`
  font-size: 14px;
  line-height: 20px;
`;

export const ButtonReject = styled(ButtonRejectAccept)`
  margin-right: 8px;
`;

export const ButtonAccept = styled(ButtonRejectAccept)`

`;

export const PopperButton = styled(SharedPopperButton)`
  width: 32px;
  height: 32px;
  min-width: 32px;
`;

export const Menu = styled(MenuList)`
  padding: 0;
`;

export const MenuItem = styled(SharedMenuItem)`
  height: 40px;
  padding: 0 24px;
`;

export const MenuText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 12px;
`;

export const Divider = styled.div`
  width: calc(100% - 32px);
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  margin: 8px auto;
`;

export const PrimaryText = styled.span`
  font-weight: 600;
`;

export const PendingText = styled.span`
  font-family: ${Fonts.PRIMARY};
  color: ${Colors.SECONDARY_50};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
