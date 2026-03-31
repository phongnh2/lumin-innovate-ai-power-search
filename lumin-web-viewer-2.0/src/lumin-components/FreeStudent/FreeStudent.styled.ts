import styled from 'styled-components';

import { mediaQuery } from 'utils/styles/mediaQuery';

import ButtonMaterial from 'luminComponents/ButtonMaterial';

import { Colors, Fonts } from 'constants/styles';
import { MAX_WIDTH_CONTAINER } from 'constants/lumin-common';
import FreeStudentBackground from 'assets/images/free-student-bg.svg';

export const Wrapper = styled.div`
  width: 100%;
  background: url("${FreeStudentBackground}") no-repeat;
  display: flex;
  justify-content: center;
  background-size: cover;
  ${mediaQuery.md`
    background: radial-gradient(160.28% 659.83% at 102.5% -2.7%, #E7F7D7 0%, #E5F9FF 51.11%, #FFEEB9 100%) /* warning: gradient uses a rotation that is not supported by CSS and may not behave as expected */;
  `}
`;
export const Container = styled.div`
  padding: 24px 12px 52px;
  display: flex;
  flex-direction: column;

  ${mediaQuery.md`
    flex-direction: row;
    padding: 20px 32px;
  `}
  ${mediaQuery.xl`
    max-width: ${MAX_WIDTH_CONTAINER}px;
  `}
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${mediaQuery.md`
    align-items: flex-start;
    margin: 56px 0 0 32px;
  `}

  ${mediaQuery.xl`
    align-items: flex-start;
    margin-top: 70px;
  `}
`;

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  margin: 20px 0 8px;

  ${mediaQuery.md`
    margin: 0 0 12px;
    font-size: 17px;
    line-height: 24px;
  `}

  ${mediaQuery.xl`
    font-size: 29px;
    line-height: 36px;
  `}
  
`;

export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 29px;
  line-height: 36px;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 16px;

  ${mediaQuery.md`
    font-size: 40px;
    line-height: 48px;
  `}

  ${mediaQuery.xl`
    font-size: 68px;
    line-height: 82px;
    margin-bottom: 24px;
  `}
`;

export const Image = styled.img`
  width: 100%;
  ${mediaQuery.md`
    width: 55%;
  `}
`;

export const CustomButton = styled(ButtonMaterial)`
  width: 240px;
`;