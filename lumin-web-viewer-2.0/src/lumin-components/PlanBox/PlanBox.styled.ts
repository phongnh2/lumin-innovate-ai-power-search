import styled from 'styled-components';
import { Link } from 'react-router-dom';

import { Colors, Shadows } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';
import Tooltip from 'lumin-components/Shared/Tooltip';
import { mediaQuery } from 'utils/styles/mediaQuery';

interface ContainerProp {
  $popular: boolean;
};

export const Container = styled.div<ContainerProp>`
  position: relative;
  margin-top: ${({ $popular }) => ($popular ? '38px' : '16px')};
  border-radius: 8px;

  &:last-child {
    margin-right: 0px;
  }

  ${mediaQuery.xl`
    width: 274px;
    margin-right: 24px;
    margin-top: 54px;
    box-shadow: ${Shadows.SHADOW_M};
  `}
`;

export const MostPopular = styled.div`
  position: absolute;
  width: 100%;
  height: 36px;
  top: -22px;
  border-radius: 8px;
  box-sizing: border-box;
  z-index: 1;
  background-color:${Colors.PRIMARY_90};
  display: flex;
  justify-content: center;
  padding-top: 4px;
`;

export const Text = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.WHITE};
`;

export const ContentContainer = styled.div`
  height: 100%;
  position: relative;
  z-index: 2;
  border: 1px solid ${({ theme }) => theme.borderColor};
  background-color: ${({ theme }) => theme.backgroundColor};
  border-radius: 8px;
`;

export const Wrapper = styled.div`
  padding: 16px;

  ${mediaQuery.md`
    padding: 24px 32px;
  `} 

  ${mediaQuery.xl`
    padding: 16px 16px 24px;
  `} 
`;

export const TopContentContainer = styled.div`
  margin-bottom: 24px;

  ${mediaQuery.md`
    display: grid;
    grid-template-columns: 13fr 10fr;
    grid-template-rows: 52px auto;
    gap: 20px 32px;
  `}

  ${mediaQuery.xl`
    display: block;
  `}
`;

export const WordContainer = styled.div`
  ${mediaQuery.md`
    grid-column: 1;
    grid-row: 1/3;
  `}
`;

export const TitleWrapper = styled.div`
  margin-bottom: 4px;
  display: flex;
  align-items: center;
`;

export const Title = styled.h3`
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  margin: 0;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}

  ${mediaQuery.xl`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const TitleIcon = styled(Icomoon)`
  margin-left: 10px;
`;

export const Description = styled.p`
  font-weight: 375;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin: 0;
`;

export const Divider = styled.div`
  display: none;

  ${mediaQuery.md`
    height: 1px;
    display: block;
    border-bottom: 1px solid ${({ theme }) => theme.dividerColor || Colors.WHITE};
  `}

  ${mediaQuery.xl`
    display: none;
  `}
`;

export const PricingContainer = styled.div<{ $warning: string }>`
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;

  ${mediaQuery.md`
    margin: 4px 0 0;
    align-items: flex-end;
  `}

  ${mediaQuery.xl`
    margin-top: 0;
    margin-bottom: ${({ $warning }: { $warning: string }) => ($warning ? '24px' : '40px')};
    align-items: flex-start;
  `}
`;

export const SubPricing = styled.div`
  font-weight: 375;
  font-size: 10px;
  line-height: 12px;
  padding-top: 2px;

  ${mediaQuery.md`
    display: flex;
    justify-content: flex-end;
    padding-top: 4px;
  `}

  ${mediaQuery.xl`
    display: block;
    padding-top: 2px;
    `}
`;

export const Pricing = styled.span`
  font-weight: 600;
  font-size: 20px;
  line-height: 24px;
`;

export const Time = styled.span`
  font-weight: 375;
  font-size: 10px;
  line-height: 14px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 4px;

  ${mediaQuery.md`
    margin-top: 2px;
  `}

  ${mediaQuery.xl`
    margin-top: 4px;
  `}
`;

export const ButtonContainer = styled.div`
  ${mediaQuery.xl`
    height: 64px;
    margin-bottom: 24px;
  `}
`;

export const Button = styled(ButtonMaterial)<ContainerProp>``;

export const SubButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

export const SubButton = styled(Link)`
  font-weight: 375;
  font-size: 10px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  text-decoration: underline;
`;

export const BenefitIntro = styled.div`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;
  font-weight: 600;

  ${mediaQuery.md`
    margin-bottom: 16px;
  `}

  ${mediaQuery.xl`
    margin-bottom: 12px;
  `}
`;

export const BenefitList = styled.div`
  ${mediaQuery.md<{ $benefitListLength: number }>`
    display: grid;
    grid-template-columns: ${({ $benefitListLength }) => $benefitListLength % 3 === 0 ? `repeat(3, minmax(100px,1fr))` : `repeat(2, 1fr)` };
    & > div:nth-child(3n+2) {
      justify-content: ${({ $benefitListLength }) => $benefitListLength % 3 === 0 && 'center'};
    }
    & > div:nth-child(3n) {
      justify-content: ${({ $benefitListLength }) => $benefitListLength % 3 === 0 && 'flex-end'};
    }
  `}

  ${mediaQuery.xl`
    display: block;
    margin-right: -6px;
    & > div:nth-child(n) {
      justify-content: flex-start;
    }
  `}
`;

export const SubDescription = styled.p`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin: 0 0 24px;

  ${mediaQuery.md`
    margin-bottom: 20px;
  `}
  
  ${mediaQuery.xl`
    margin-bottom: 24px;
  `}
`;

export const Warning = styled.p`
  font-style: normal;
  font-weight: 375;
  font-size: 10px;
  line-height: 14px;
  color: ${Colors.NEUTRAL_80};
  width: fit-content;
`;

export const DocstackContainer = styled.div``;

export const Docstack = styled.span``;

export const DocstackDescription = styled.span``;


export const LimitedPlan = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0;

  ${mediaQuery.md`
    margin-top: -12px;
  `}

  ${mediaQuery.xl`
    margin: 16px 0 24px;
  `}
`;

export const LimitedDocument = styled.span<{$isEnglish: boolean}>`
  font-weight: 375;
  font-size: 12px;
  line-height: 16px;
  text-decoration: underline;
  white-space: ${({ $isEnglish }) => $isEnglish && 'nowrap'};
  color: ${Colors.NEUTRAL_100};
  cursor: pointer;
`;

export const UnlimitedDocument = styled(Icomoon)`
  cursor: pointer;
`;

export const LimitedDivider = styled.span<{$isEnglish: boolean}>`
  width: 1px;
  height: 24px;
  background: ${Colors.NEUTRAL_100};
  margin: 0 16px;

  ${mediaQuery.md`
    height: 32px;
    margin: 0 24px;
  `}

  ${mediaQuery.xl`
    height: 40px;
    margin: ${({ $isEnglish }: {$isEnglish: boolean}) => $isEnglish ? '0 26px' : '0 16px'};
  `}
`;

export const LimitedCollaborator = styled.span`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
`;

export const AdditionalInfoTooltip = styled(Tooltip)`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const AdditionalInfoIcon = styled(Icomoon)`
  margin-left: 8px;
  cursor: pointer;
`;