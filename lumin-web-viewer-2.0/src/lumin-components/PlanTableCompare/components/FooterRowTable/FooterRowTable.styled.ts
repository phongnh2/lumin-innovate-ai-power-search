import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { baseRowStyles } from '../DetailPlanRow/DetailPlanRow.styled';

export const Row = styled.div`
  ${baseRowStyles}
  background-color: ${Colors.WHITE};
  min-height: 44px;
  margin: 0 auto;
`;

export const ButtonWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-self: flex-start;
  padding: 12px 4px;
  border-left: 1px solid ${Colors.NEUTRAL_30};
  background-color: ${Colors.WHITE};

  ${mediaQuery.xl`
    padding: 12px 16px;
  `}
`;

export const Button = styled(ButtonMaterial)`
  width: 100%;
  height: max-content;
  font-size: 10px;
  line-height: 16px;
  padding: 8px 16px;

  ${mediaQuery.xl`
    font-size: 12px;
  `}

  span {
    text-align: center;
    white-space: normal;
  }
`;
