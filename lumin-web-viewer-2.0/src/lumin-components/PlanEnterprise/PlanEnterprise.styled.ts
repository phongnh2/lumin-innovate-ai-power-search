import styled from 'styled-components';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';

export const LuminEnterpriseContainer = styled.div`
  padding: 16px;

  ${mediaQuery.md`
    padding: 16px 48px;
  `}

  ${mediaQuery.xl`
    margin: 0 auto;
    max-width: ${MAX_WIDTH_CONTAINER}px;
    padding: 32px 18px;
  `}
`;
export const IntroductionWrapper = styled.div`
  width: 100%;
  margin-bottom: 16px;

  ${mediaQuery.md`
    position: relative;
    width: 562px;
    margin: 0 auto 16px;
  `}

  ${mediaQuery.xl`
    width: 840px;
    margin-bottom: 32px;
  `}
`;

export const Introduction = styled.div`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    width: 320px;
    font-size: 14px;
    line-height: 20px;
    margin: 0 auto;

    &:before {
      content: '';
      display: inline-block;
      position: absolute;
      left: 0;
      top: 50%;
      width: 72px;
      height: 1px;
      background-color: ${Colors.NEUTRAL_30};
    }

    &:after {
      content: '';
      display: inline-block;
      position: absolute;
      right: 0;
      top: 50%;
      width: 72px;
      height: 1px;
      background-color: ${Colors.NEUTRAL_30};
    }
  `}

  ${mediaQuery.xl`
    width: 632px;
  `}
`;

export const Box = styled.div`
  border-radius: 8px;
  border: 1px solid ${Colors.OTHER_19};
  background-color: ${Colors.WHITE};

  ${mediaQuery.md`
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    height: 320px;
  `}

  ${mediaQuery.xl`
    display: grid;
    grid-template-columns: 604px auto;
  `}
`;

export const Banner = styled.img`
  width: 100%;
  ${mediaQuery.md`
    border-radius: 8px 0 0 8px;
    height: 318px;
  `}
`;

export const ContentContainer = styled.div`
  padding: 24px;

  ${mediaQuery.md`
    padding: 66px 20px 74px 20px;
  `}

  ${mediaQuery.xl`
    padding: 74px 40px;
  `}
`;

export const Title = styled.h2`
  width: 206px;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  margin: 0;

  ${mediaQuery.xl`
    width: 250px;
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const Description = styled.div`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  margin: 12px 0 16px 0;
  color: ${Colors.NEUTRAL_80};
`;

export const ButtonWrapper = styled.div`
  width: 100%;
`;

export const LeftButton = styled(ButtonMaterial)`
  font-weight: 600;
  min-width: 136px;
  font-size: 14px;
  line-height: 20px;

  ${mediaQuery.md`
    min-width: 100%;
  `}

  ${mediaQuery.xl`
    min-width: 176px;
  `}
`;

export const RightButton = styled(ButtonMaterial)`
  min-width: 136px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
`;
