import styled from 'styled-components';
import { MenuList } from '@mui/material';

import Chip from 'lumin-components/Shared/Chip';
import SharedLoading from 'lumin-components/Loading';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import SharedPopperButton from 'lumin-components/PopperButton';
import SharedMenuItem from 'lumin-components/Shared/MenuItem';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { ORGANIZATION_ROLE_SHORTEN_KEY } from 'constants/organizationConstants';

export const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;

  ${mediaQuery.md`
    padding: 24px;
  `}

  ${mediaQuery.xl`
    max-width: 1088px;
    padding: 40px 0;
    margin-top: 0;
  `}
`;

export const TitleWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
`;

export const OrgListTitle = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin-right: 15px;

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}

  ${mediaQuery.xl`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const GridContainer = styled.div`
  margin: auto;
  width: 100%;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  margin-top: 16px;

  ${mediaQuery.md`
    gap: 24px;
    margin-top: 32px;
  `}

  ${mediaQuery.xl`
    grid-template-columns: repeat(4, minmax(260px, 1fr));
    gap: 16px;
    margin-top: 48px;
  `}
`;

export const GridItem = styled.div``;

export const CreateBtn = styled.div`
  width: 100%;
  height: 134px;
  margin: auto;
  display: flex;
  border: 2px dashed ${Colors.PRIMARY_90};
  border-radius: var(--border-radius-primary);
  background-color: ${Colors.PRIMARY_10};
  box-sizing: border-box;

  ${mediaQuery.md`
    height: 100%;
  `}
`;

export const ContentCreateBtn = styled.div`
  margin: auto;
  text-align: center;
  padding: 16px;
`;

export const CreateTitle = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 20px;
`;

const getBgColorByOrgRole = (role) => {
  const colors = {
    [ORGANIZATION_ROLE_SHORTEN_KEY.ORGANIZATION_ADMIN]: Colors.SECONDARY_50,
    [ORGANIZATION_ROLE_SHORTEN_KEY.BILLING_MODERATOR]: Colors.PRIMARY_80,
    [ORGANIZATION_ROLE_SHORTEN_KEY.MEMBER]: Colors.NEUTRAL_50,
  };
  return colors[role];
};

export const OrgRole = styled(Chip)`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.WHITE};
  padding: 2px 8px;
  margin-right: 2px;
  border-radius: 4px;
  background-color: ${(props) => getBgColorByOrgRole(props.role)};
`;

export const OrgCardName = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  ${mediaQuery.xl`
    text-align: center;
  `}
`;

export const Wrapper = styled.div`
  width: 100%;
  padding: 20px 20px 16px;
  background-color: ${Colors.WHITE};
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: var(--border-radius-primary);
  box-sizing: border-box;
  position: relative;
  transition: all 0.25s ease;

  ${mediaQuery.md`
    padding: 24px 28px 24px;
  `}

  ${mediaQuery.xl`
    min-height: 264px;
    padding: 16px;

    .popper-button {
      visibility: hidden;
      opacity: 0;
    }
    &:hover {
      box-shadow: var(--shadow-xs);
      border-color: ${Colors.PRIMARY_80};

      .popper-button {
        visibility: visible;
        opacity: 1;
      }
    }
  `}
`;

export const RoleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const RoleWrapper = styled.div``;

export const CardNameContainer = styled.div`
  display: grid;
  grid-template-columns: 48px auto;
  gap: 3px 8px;
  align-items: center;
  margin-top: 20px;

  ${mediaQuery.md`
    gap: 16px 12px;
  `}

  ${mediaQuery.xl`
    margin-top: 28px;
    grid-template-columns: 1fr;
    gap: 12px;
    justify-items: center;
  `}
`;

export const AvatarContainer = styled.div`
  grid-row: 1 / 3;

  ${mediaQuery.md`
    grid-row: unset;
  `}
`;

export const MobileAddButton = styled(ButtonMaterial)`
  min-width: 24px;
  height: 24px;
  padding: 0;
`;

export const MemberAvatarGroup = styled.div`
  display: flex;
  align-items: center;
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

export const Loading = styled(SharedLoading)`
  margin-top: 36px;
  align-self: center;
`;

export const BtnIcon = styled(ButtonIcon)`
  background: ${Colors.WHITE};
  border: 2px solid ${Colors.DARK_SKY_BLUE};
  margin-right: 8px;

  &:hover {
    background: ${Colors.WHITE};
  }
`;

export const PopperButton = styled(SharedPopperButton)`
  min-width: 32px;
  height: 32px;
  padding: 0;
  position: absolute;
  top: 18px;
  right: 22px;
  ${mediaQuery.xl`
    top: 10px;
    right: 14px;
  `}
`;

export const Menu = styled(MenuList)`
  min-width: 230px;
  padding: 0;
`;

export const MenuItem = styled(SharedMenuItem)`
  min-height: 40px;
  display: flex;
  align-items: center;
`;

export const TextMenu = styled.p`
  color: ${Colors.NEUTRAL_80};
  margin-left: 8px;
`;
