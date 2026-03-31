import styled from 'styled-components';
import Scrollbars from 'react-custom-scrollbars-2';
import { Colors, Fonts } from 'constants/styles';
import { ENTITY } from 'constants/lumin-common';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  width: 100%;
  max-width: 328px;
  box-sizing: border-box;
  
  ${mediaQuery.sm`
    max-width: 400px;
  `}
`;
export const Header = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
`;
export const IconContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  ${mediaQuery.sm`
    margin-bottom: 16px;
  `}
`;
export const Title = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 16px;

`;
export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};

  ${mediaQuery.sm`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const ListContainer = styled.div`
`;
export const ListItem = styled.li`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.type === ENTITY.ORGANIZATION_TEAM ? '8px 0' : '6px 0')};
  margin-bottom: ${(props) => (props.type === ENTITY.ORGANIZATION_TEAM ? '2px' : '4px')};
  & > div:first-child {
    flex-shrink: 0;
  }
`;
export const Link = styled.a`
  display: block;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  text-decoration-line: underline;
  margin-left: 12px;
  overflow: hidden;
  text-overflow: ellipsis; 
  white-space: nowrap;
`;
export const OrgName = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 12px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 12px;
  margin-top: 4px;
`;
export const ListItemContent = styled.div`
`;

export const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
`;

export const Tab = styled.div`
  width: 50%;
  padding: 10px 0;
  cursor: pointer;

  ${({ active }) => active && `
    border-bottom: 2px solid ${Colors.NEUTRAL_100};
  `}

  ${({ isDisabled }) => isDisabled && `
    pointer-events: none;
  `}
`;

export const Label = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_60};
  text-align: center;

  ${({ active }) => active && `
    color: ${Colors.NEUTRAL_100};
  `}
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};

  button {
    width: 100%;
    padding: 10px;
  }
`;
export const CustomScrollbars = styled(Scrollbars)`
  div {
    overflow: hidden;
  }
  div > li:first-child{
    margin-top: 8px;
  }
`;
