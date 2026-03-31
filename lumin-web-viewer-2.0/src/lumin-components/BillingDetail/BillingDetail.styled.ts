import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const Wrapper = styled.div`
  border-radius: var(--border-radius-primary);
  border: 1px solid ${Colors.NEUTRAL_60};
`;

export const Container = styled.div`
  padding: 16px;
  ${mediaQuery.md`
    padding: 24px 16px;
  `}
`;

export const Divider = styled.hr`
  background-color: ${Colors.NEUTRAL_20};
  color: ${Colors.NEUTRAL_20};
  margin: 0;
  height: 1px;
  border-width: 0;
`;

export const HorizontalDivider = styled(Divider)`
  display: block;
  margin: 16px 0;
`;

export const AutoUpgradeDescription = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 375;
  color: ${Colors.NEUTRAL_80};
`;

export const HighlightAutoUpgrade = styled.span`
  display: inline-block;
  cursor: pointer;
  position: relative;
  &:before {
    content: '';
    display: block;
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 0;
    border-bottom: 1px dashed ${Colors.NEUTRAL_80};
  }
`;

export const DescriptionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TeamPromotion = styled.div`
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

export const PromotionText = styled.p`
  font-size: 12px;
  line-height: 16px;
  font-weight: 375;
  color: ${Colors.SUCCESS_50};
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    font-weight: 400;
  `}
`;

export const AutoUpgradeTitle = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  margin-bottom: 8px;
`;

export const UpgradeContainer = styled.div`
  padding: 16px;
  ${mediaQuery.md`
    padding: 16px 16px 24px;
  `}
`;
