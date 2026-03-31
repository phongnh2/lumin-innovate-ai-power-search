import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const TooltipContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0;
  }
  ${mediaQuery.md`
    flex-direction: row;
  `}
`;

export const TooltipLabel = styled.p`
  width: 100%;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.WHITE};
  margin-bottom: 4px;

  ${mediaQuery.md`
    width: 40%;
    font-size: 14px;
    line-height: 20px;
    margin-bottom: 0;
  `}
`;

export const TooltipText = styled.p`
  width: 100%;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 14px;
  color: ${Colors.WHITE};

  ${mediaQuery.md`
    width: 60%;
    font-size: 12px;
    line-height: 16px;
  `}
`;
