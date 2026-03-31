import styled from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Colors, Fonts } from 'constants/styles';
import { styledPropConfigs } from 'utils/styled';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';

export const Container = styled.div`
  position: relative;
  width: 240px;
  box-sizing: border-box;
  background-color: ${Colors.WHITE};
  border-radius: 8px;
`;
export const Header = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 9px 0 16px;
`;
export const AvatarContainer = styled.div`
  margin-bottom: 8px;
`;
export const SectionHeader = styled.div`
  border-top: 1px solid ${Colors.NEUTRAL_20};
  display: flex;
  justify-content: space-between;
  padding-right: 16px;
`;
export const IconButton = styled(ButtonIcon)`
  margin-top: 12px;
  padding: 4px;
`;
export const HeaderTitle = styled.h2`
  border-top: ${({ hasOrg }) => (hasOrg ? 'none' : `1px solid ${Colors.NEUTRAL_20}`)};
  padding: 16px 16px 4px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: ${Colors.SECONDARY};
`;
export const ListItem = styled(RouterLink).withConfig(styledPropConfigs(['isActive']))`
  display: grid;
  grid-template-columns: min-content minmax(0, 1fr) 16px;
  column-gap: 8px;
  align-items: center;
  padding: 12px 14px;
  transition: background-color 0.3s ease;
  cursor: pointer;
  position: relative;
  background-color: ${({ isActive }) => (isActive ? Colors.PRIMARY_20 : 'none')};
  &:before {
    content: "";
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
export const ItemBody = styled.div`

`;
export const CreateOrgContainer = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ButtonCreateOrg = styled(ButtonMaterial)`
  background-color: white;
  border: 1px solid ${Colors.SECONDARY_50};
  &:hover{
    span {
      color: white;
    }
    .icon-plus-thin {
      color: white !important;
    }
  }
`;
export const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;
export const NewOrganizationIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${Colors.SECONDARY_10};
  margin-right: 8px;
`;
export const Description = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  width: 164px;
  color: ${Colors.NEUTRAL_100};
`;
export const MoreOrganizations = styled(RouterLink)`
  box-sizing: content-box;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 14px;
  font-weight: 600;
  line-height: 20;
  color: ${Colors.NEUTRAL_100};
  transition: background-color 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: ${Colors.PRIMARY_20};
  }
`;
export const Bottom = styled.div`
  padding: 8px 16px;
  flex-direction: column;
  display: flex;
  align-items: center;
  margin-top: ${({ spaceTop }) => (spaceTop ? '8px' : 0)};
`;
export const Link = styled(RouterLink)`
  color: ${Colors.SECONDARY_50};
  font-size: 14px;
  display: flex;
  align-items: center;
  font-weight: 600;
  padding: 9px 0;
  cursor: pointer;
`;
export const ButtonContent = styled(RouterLink)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ButtonText = styled.span`
  display: inline-block;
  margin-left: 8px;
  color: ${Colors.SECONDARY_50};
`;

export const ButtonTextWithoutBorder = styled.span`
  display: inline-block;
  margin-left: 8px;
  font-size: 14px;
  font-weight: bold;
  color: ${Colors.SECONDARY_50};
`;

export const Setting = styled.div`
  position: absolute;
  cursor: pointer;
  right: 16px;
  top: 16px;
`;
export const MoreText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;
export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${Colors.NEUTRAL_20};
  margin: 8px 0;
`;
