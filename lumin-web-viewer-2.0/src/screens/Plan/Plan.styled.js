import styled, { css } from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Fonts } from 'constants/styles';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const StyledPlanContainer = styled.section`
  position: relative;
  border-radius: 4px;
  margin-bottom: 56px;
  padding: 0 16px;

  ${mediaQuery.md`
    margin: 0 auto 64px;
    padding: 0 24px;
  `}

  ${mediaQuery.xl`
    padding: 0;
    margin: 0 auto 88px;
    display: grid;
    grid-template-columns: repeat(${(props) => props.columns}, minmax(0, 1fr));
    justify-content: center;
    align-items: flex-start;
    gap: 24px;
  `}
`;

export const PlanPackageTime = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_50};
  margin-top: 8px;
`;

export const PlanTooltip = css`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.SECONDARY_50};
  background: ${Colors.WHITE};
  border-radius: 12px;
`;

export const StyledPricingWrapper = styled.div`
  padding-top: 24px;
  background-color: ${Colors.PRIMARY_10};

  ${mediaQuery.md`
    padding-top: 32px;
  `}

  ${mediaQuery.xl`
    padding-top: 40px;
  `}
`;

export const StyledPricingContainer = styled.div``;

export const StyledPricingTitle = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 800;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}

  ${mediaQuery.xl`
    font-size: 40px;
    line-height: 60px;
  `}
`;

export const StyledPricingSubTitle = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  margin: 4px 0 8px;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin: 12px 0 8px;
  `}

  ${mediaQuery.xl`
    margin-bottom: 9px;
  `}
`;

export const BorderWrapper = styled.div`
  position: relative;

  ${mediaQuery.md`
    margin-left: 12px;
  `}

  ${mediaQuery.xl`
    min-width: 372px;
    margin-left: 0;
  `}
`;

export const BorderTop = styled.div`
  width: 100%;
  height: 32px;
  top: -8px;
  background-color: ${Colors.NEUTRAL_30};
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: 8px;
  box-sizing: border-box;
  position: absolute;
  z-index: 1;

  ${mediaQuery.md`
    width: 50px;
    height: 100%;
    top: 0;
    left: -12px;
  `}

  ${mediaQuery.xl`
    width: 100%;
    height: 32px;
    top: -8px;
    left: unset;
  `}

  ${({ $featured }) => $featured && `
    background-color: ${Colors.OTHER_2};
    border: 1px solid ${Colors.OTHER_2};
  `}

  ${({ $title }) => $title === 'Enterprise' && `
    background-color: ${Colors.SUCCESS_50};
    border: 1px solid ${Colors.SUCCESS_50};
  `}
`;

export const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: ${Colors.WHITE};
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: 8px;
  margin-bottom: 32px;
  position: relative;
  box-sizing: border-box;
  z-index: 2;

  ${mediaQuery.md`
    padding: 24px 32px 8px;
  `}

  ${mediaQuery.xl`
    min-width: 372px;
    padding: 24px;
    transition: all 0.1s ease;

    ${({ $organization }) => ($organization ? `
      min-height: 582px;
    ` : `
      height: 508px;
    `)}

    ${({ $numberButton }) => $numberButton === 0 && `
      height: 438px;
    `}
  `}

  ${({ $featured }) => $featured && `
    background-color: ${Colors.PRIMARY_70};
    border: 1px solid ${Colors.PRIMARY_70};
  `}

  ${({ $title }) => $title === 'Enterprise' && `
    border: 1px solid ${Colors.SUCCESS_50};
  `}
`;

export const ContentWrapper = styled.div`
  width: 100%;
`;

export const ImageContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;

  ${mediaQuery.md`
    margin-bottom: 32px;
  `}

  ${mediaQuery.xl`
    margin-bottom: 24px;
  `}
`;

export const ImageWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;

  ${mediaQuery.xl`
    ${({ $organization }) => $organization && `
      min-height: 286px;
      justify-content: space-between;
    `}

    ${({ $isSamePeriod }) => $isSamePeriod && `
      min-height: 336px;
    `}
  `}
`;

export const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ $organization, $featured }) => $organization && $featured && `
    margin-bottom: 32px;
  `}

  ${mediaQuery.md`
    ${({ $organization, $featured }) => $organization && $featured && `
      margin-bottom: 8px;
    `}
  `}

  ${mediaQuery.xl`
    flex-direction: column;
    align-items: unset;

    ${({ $organization, $featured }) => ($organization && $featured && 'margin-bottom: 8px;')}
  `}
`;

export const PlanTitle = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: ${Colors.NEUTRAL_90};
  margin: 0;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}

  ${mediaQuery.xl`
    font-size: 32px;
  `}

  ${({ $featured }) => $featured && `
    color: ${Colors.WHITE}
  `}
`;

export const PriceWrapper = styled.div`
  display: flex;
  margin: 0px;
  
  ${mediaQuery.md`
    flex-direction: column;
    align-items: flex-end;
  `}

  ${mediaQuery.xl`
    margin-top: 40px;
    align-items: flex-start;
  `}
`;

export const Price = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;

  ${mediaQuery.md`
    flex-direction: row;

    ${({ $organization, $featured }) => $organization && $featured && `
      order: 2;
    `}
  `}

  ${mediaQuery.xl`
    ${({ $organization, $featured }) => $organization && $featured && `
      order: 1;
    `}
  `}
`;

export const PriceNumber = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 29px;
  line-height: 36px;
  color: ${Colors.PRIMARY_90};

  ${mediaQuery.md`
    font-size: 48px;
    line-height: 48px;
  `}

  ${({ $featured }) => $featured && `color: ${Colors.WHITE}`}
`;

export const PackageTime = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_50};
  margin: 4px 0 0;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin-left: 8px;
  `}

  ${({ $featured }) => $featured && `color: ${Colors.WHITE}`}
`;

export const EnterpriseText = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_50};
  text-align: right;
  margin: 0;

  ${mediaQuery.md`
    max-width: 210px;
    font-size: 17px;
    line-height: 24px;
  `}

  ${mediaQuery.xl`
    max-width: 100%;
    font-size: 20px;
    line-height: 28px;
    text-align: left;
    margin-top: 40px;
  `}
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 24px;

  ${mediaQuery.md`
    flex-direction: row-reverse;
    align-items: center;
    justify-content: space-between;

    ${({ $organization, $featured }) => $organization && $featured && `
      flex-direction: row;
    `}
  `}

  ${mediaQuery.xl`
    flex-direction: column;
    margin-top: 40px;
  `}
`;

export const ButtonWrapperEnterPrise = styled.div`
  width: 100%;

  ${mediaQuery.sm`
    display: grid;
    grid-template-columns: 140px 248px;
    column-gap: 32px;
    align-items: center;

    ${({ $isSamePeriod, $isEnterprise }) => $isSamePeriod && $isEnterprise && `
      width: 420px;
    `}

    ${({ $isSamePeriod, $isEnterprise }) => !$isSamePeriod && $isEnterprise && `
      width: 252px;
    `}
  `}

  ${mediaQuery.xl`
    width: 100%;
    display: block;
  `}
`;

export const PlanButton = styled(ButtonMaterial)`
  width: 100%;

  ${mediaQuery.md`
    width: 252px;

    ${({ $isSamePeriod }) => $isSamePeriod && `
      width: 166px;
    `}
  `}

  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const CurrentPlanWrapper = styled.div`
  display: flex;

  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const CurrentPlanContainer = styled.div`
  width: 100%;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Colors.NEUTRAL_20};
  border-radius: 8px;

  ${({ $isProfessional }) => $isProfessional && `
    background-color: ${Colors.NEUTRAL_10};
  `}

  ${mediaQuery.md`
    width: 252px;
  `}

  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const CurrentPlanText = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.PRIMARY_90};
  margin-left: 12px;
`;

export const PlanDivider = styled.div`
  width: 100%;
  margin-top: 16px;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  position: relative;

  &:before,
  &:after {
    content: '';
    width: 16px;
    height: 1px;
    border-bottom: 1px solid ${Colors.NEUTRAL_20};
    position: absolute;
  }

  &:before {
    top: -1px;
    left: -16px;
  }

  &:after {
    top: -1px;
    right: -16px;
  }

  ${mediaQuery.md`
    width: calc(100% - 24px - 252px);
    margin-top: 0;

    &:before,
    &:after {
      width: 0;
    }

    ${({ $isSamePeriod }) => $isSamePeriod && `
      width: calc(100% - 64px - 140px - 166px);
    `}

    ${({ $organization, $featured }) => $organization && $featured && `
      display: none;
    `}

    ${({ $hasNoButton }) => $hasNoButton && `
      width: 100%;
      margin-top: 48px;
    `}

    ${({ $isSamePeriod, $isEnterprise }) => $isSamePeriod && $isEnterprise && `
      width: calc(100% - 64px - 140px - 248px);
    `}

    ${({ $isSamePeriod, $isEnterprise }) => !$isSamePeriod && $isEnterprise && `
      width: calc(100% - 24px - 252px);
    `}
  `}

  ${mediaQuery.xl`
    width: 100%;
    margin-top: 24px;

    &:before {
      width: 24px;
      left: -24px;
    }

    &:after {
      width: 24px;
      right: -24px;
    }

    ${({ $organization, $featured }) => $organization && $featured && `
      display: block;
    `}

    ${({ $organization, $hasNoButton }) => $organization && $hasNoButton && `
      margin-top: 0;
    `}

    ${({ $hasNoButton }) => $hasNoButton && `
      margin-top: 112px;
    `}

    ${({ $numberButton }) => $numberButton === 0 && `
      margin-top: 40px;
    `}
  `}
`;
export const StyledSegmentTab = styled.div`
  display: flex;
  justify-content: center;
`;
export const StyledActiveTabContainer = styled.div`
  transition: all 0.3s ease;
  will-change: transform, opacity;
`;

export const PlanBoxContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;

  ${mediaQuery.sm`
    padding: 0 48px;
    margin: 0 auto;
  `}

  ${mediaQuery.xl`
    flex-direction: row;
    padding: 0 18px;
    max-width: ${MAX_WIDTH_CONTAINER}px;
  `}
`;