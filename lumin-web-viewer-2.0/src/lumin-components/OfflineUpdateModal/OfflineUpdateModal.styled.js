import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors, Fonts } from 'constants/styles';

export const Title = styled.p`
  font-weight: 600;
  font-family: ${Fonts.PRIMARY};
  font-size: 20px;
  font-style: normal;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
`;

export const SubTitle = styled.p`
  font-weight: 400;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  margin-top: 24px;
  color: ${Colors.NEUTRAL_80};
`;

export const ItemWrapper = styled.ul`
  display: flex;
  flex-direction: column;
`;

export const ItemContainer = styled.li`
  padding-left: 8px;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-style: normal;
  line-height: 20px;
  margin-bottom: 4px;
  color: ${Colors.NEUTRAL_80};
  :before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 2px;
    background-color: ${Colors.NEUTRAL_80};
    margin-right: 5px;
  }
`;

export const MessageWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 14px;
`;

export const Message = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  color: ${Colors.SUCCESS_50};
  font-weight: normal;
  margin-left: 12px;
  line-height: 20px;
`;

export const Button = styled(ButtonMaterial)`
  flex: 1;
  &.secondary {
    border: none;
  }
  ${(props) => props.$confirmBtn && `
    margin-left: 16px;
  `};
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 24px;
`;

export const BoldText = styled.span`
  font-weight: bold;
`;
