import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors, Fonts } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  min-height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${Colors.PRIMARY_10};
  border-right: var(--border-secondary);
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  width: 100%;
`;

export const Block = styled.div`
  margin-bottom: ${({ middleBlock }) => (middleBlock ? '0px' : '24px')};
  display: flex;
  flex-direction: column;
  flex-grow: ${({ middleBlock }) => (middleBlock ? 1 : 0)};
  justify-content: space-between;
  & > div:nth-child(3) {
    display: none;
  }
`;

export const Header = styled.div`
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const LogoLink = styled(Link)`
  display: inline-block;
  width: 100%;
  max-width: 134px;
  & > img {
    height: 28px;
  }
`;

export const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  margin: 10px 0 10px;
  height: 56px;
`;

export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  margin-top: 4px;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  text-align: left;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  text-transform: none;
`;
export const Title = styled(Text)`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.43;
  color: ${Colors.NEUTRAL_100};
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 100%;
  padding: ${(props) => props.hasPadding && '0 16px'};
  box-sizing: border-box;
  margin-top: 0px;
`;
export const UpgradePlanButton = styled(ButtonMaterial)`
  margin-top: 8px;
  ${mediaQuery.sm`
    display: none;
  `}
`;
export const List = styled.div`
  display: flex;
  flex-direction: column;
`;
export const ListLoading = styled(List)`
  border-top: none;
  padding: 0 16px;
`;
export const Bottom = styled.div`
  position: absolute;
  bottom: 0px;
  padding: 16px 16px 24px;
  width: 208px;
`;
export const NewOrganization = styled.div`
  display: grid;
  column-gap: 8px;
  grid-template-columns: 40px minmax(0, 1fr);
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: ${Colors.PRIMARY};
  & > span {
    font-family: ${Fonts.PRIMARY};
    font-style: normal;
    font-weight: 600;
    font-size: 12px;
    line-height: 1.33;
    color: ${Colors.NEUTRAL_100}
  }
`;
export const NewOrganizationIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${Colors.SECONDARY_10};
`;
export const TitleGroup = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 1.33;
  color: ${Colors.NEUTRAL_60};
  margin: 0 0 8px 16px;
  width: fit-content;
`;
export const BottomGroup = styled.div`
  
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
export const CloseButton = styled.div`
  display: block;
  width: 24px;
  height: 24px;
  margin-right: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background-color: ${Colors.NEUTRAL_20};
  }
  ${mediaQuery.lg`
    display: none;
  `}
`;

export const TextNameContainer = styled.div`
  white-space: nowrap;
  display: flex;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-size: 14px;
  line-height: 20px;
`;

export const OrgName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const DocumentText = styled.span`
  flex-shrink: 0;
`;
