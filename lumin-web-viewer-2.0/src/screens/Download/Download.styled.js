import styled from 'styled-components';

import { Fonts, Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonMaterial from 'lumin-components/ButtonMaterial';

import * as StyledLayout from 'lumin-components/Layout/Layout.styled';

export const Wrapper = styled.div`
  height: 100%;
  & > ${StyledLayout.Container} {
    height: 100%;
  }
`;
export const Container = styled.div`
  position: relative;
  width: 100%;
  padding: 48px 16px 37px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 0 auto;
  overflow: hidden;
  ${mediaQuery.md`
    padding: 88px 0 75px;
  `}
  ${mediaQuery.xl`
    padding: 104px 0 165px;
  `}
`;

export const DescriptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  ${mediaQuery.xl`
    width: 35%;
    align-items: flex-start;
  `}
`;
export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  ${mediaQuery.xl`
    flex-direction: row-reverse;
    justify-content: normal;
    max-width: var(--container-primary);
    padding: 0 20px;
  `}
  ${mediaQuery.xxl`
    padding: 0;
  `}
`;

export const SubTitle = styled.h2`
  display: none;
  font-size: 24px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: normal;
  color: ${Colors.NEUTRAL_60};
  margin: 0;
  text-align: left;
  ${mediaQuery.xl`
    display: block;
  `}
`;

export const Title = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-size: 24px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: -0.5px;
  color: ${Colors.NEUTRAL_100};
  margin: 80px 0 16px;
  ${mediaQuery.md`
    line-height: 36px;
    margin: 116px 0 13px;
    font-size: 29px;
  `}
  ${mediaQuery.xl`
    text-align: left;
    margin: 16px 0;
    font-size: 40px;
    line-height: 56px;
    max-width: 400px;
  `}
`;

export const Text = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.43;
  letter-spacing: 0.34px;
  color: ${Colors.NEUTRAL_80};
  max-width: 400px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 1.41;
  `}
  ${mediaQuery.xl`
    text-align: left;
  `}
  a {
    color: ${Colors.SECONDARY_50};
    text-decoration: underline;
  }
`;

export const PrimaryImageContainer = styled.div`
  ${mediaQuery.xl`
    width: 65%;
  `}
`;

export const PrimaryImage = styled.img`
  width: 100%;
  display: block;
  margin: 0 auto;
  z-index: 1;
  ${mediaQuery.md`
    max-width: none;
  `}
  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const IconChrome = styled.img`
  height: 40px;
  margin-bottom: -8px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`;

export const ButtonInstall = styled(ButtonMaterial)`
  max-height: 40px;
  min-width: 240px;
  ${mediaQuery.sm`
    max-height: none;
  `}
`;
