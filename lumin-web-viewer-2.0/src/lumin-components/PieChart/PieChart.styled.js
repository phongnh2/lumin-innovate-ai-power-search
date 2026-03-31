import { Colors, Fonts } from 'constants/styles';
import styled, { css } from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
`;

export const StyledChart = styled.div`
  position: relative;
  width: 96px;
  height: 96px;

  ${mediaQuery.md`
    width: 124px;
    height: 124px;
  `}
`;
export const MiddleCircleChart = styled.div`
  top: 50%;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  position: absolute;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: ${Colors.PRIMARY_70};
  ${mediaQuery.md`
    width: 80px;
    height: 80px;
  `}
`;
export const StyledLegendContainer = styled.div`
  display:flex;
  align-items: center;
  padding-left: 15px;
  flex: 1;
  ${mediaQuery.md`
    padding-left: 64px;
  `}
  ${({ $loading }) => $loading &&
    css`
      box-sizing: border-box;
      width: 185px;
    `}
`;

export const StyledLegendItem = styled.li`
  font-family: var(--font-primary);
  margin-top: 8px;
  ${mediaQuery.md`
    margin-top: 16px;
  `}
`;

export const StyledLegendItemRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 3px;
`;

export const StyledLegendBlock = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background-color: ${Colors.WHITE};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  ${mediaQuery.md`
    width: 24px;
    height: 24px;
  `}
`;
export const DescriptionColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 4px;
  ${mediaQuery.md`
    width: 14px;
    height: 14px;
  `}
`;
export const TextContainer = styled.div`
  margin-left: 8px;
`;
export const LegendValue = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.WHITE};
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;
export const StyledLegendContent = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.WHITE};
  white-space: nowrap;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const StyledLegendName = styled.span`
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: 0.34px;
  color: $secondary;
  padding-left: 24px;
  color: ${Colors.SECONDARY};

  ${mediaQuery.sm`
    font-size: 16px;
  `}
`;
