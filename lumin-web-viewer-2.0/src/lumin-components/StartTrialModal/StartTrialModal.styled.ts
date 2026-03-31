import styled from 'styled-components';

import ButtonMaterial from 'luminComponents/ButtonMaterial';

import { mediaQuery } from 'utils/styles/mediaQuery';

import { Colors, Fonts } from 'constants/styles';

interface ThemeProps {
  theme?: {
    title?: string;
    subTitle?: string;
    message?: string;
    checkboxLabel?: string;
  };
}

export const Container = styled.div`
  width: 100%;
  display: block;
  margin-top: 12px;
  ${mediaQuery.md`
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    margin-top: 4px;
  `}
`;

export const ContainerReskin = styled.div`
  width: 100%;
  display: block;
  margin: 'revert-layer';
  ${mediaQuery.md`
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  `}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

export const Title = styled.h2<ThemeProps>`
  font-family: ${Fonts.PRIMARY};
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  font-style: normal;
  letter-spacing: normal;
  color: ${({ theme }) => theme?.title || Colors.NEUTRAL_100};
  margin-bottom: 16px;
  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const TitleReskin = styled.h2<ThemeProps>`
  font-family: ${Fonts.SIGN_PRIMARY};
  font-size: 18px;
  line-height: 130%;
  font-weight: 700;
  font-style: normal;

  letter-spacing: normal;
  color: ${({ theme }) => theme?.title};
  margin-bottom: 16px;
  ${mediaQuery.md`
    font-size: 22px;
    line-height: 130%;
    margin-bottom: 16px;
  `}
`;

export const SubTitle = styled.p<ThemeProps>`
  font-family: ${Fonts.PRIMARY};
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  font-style: normal;
  color: ${({ theme }) => theme?.subTitle || Colors.NEUTRAL_80};
`;

export const SubTitleReskin = styled.p<ThemeProps>`
  font-family: ${Fonts.SECONDARY};
  font-weight: 500;
  font-size: 14px;
  line-height: 140%;
  font-style: normal;
  color: ${({ theme }) => theme?.title};
`;

export const DetailContainer = styled.div`
  display: grid;
  grid-row-gap: 24px;
  margin-top: 16px;
  ${mediaQuery.md`
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-column-gap: 32px;
  `}
`;

export const DetailContainerReskin = styled.div`
  display: grid;
  grid-row-gap: 12px;
  margin-top: 16px;
  margin-bottom: 0;

  ${mediaQuery.md`
    margin-top: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-column-gap: 16px;
  `}
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: center;
`;

export const DetailMessage = styled.p<ThemeProps>`
  padding-left: 12px;
  font-size: 14px;
  font-weight: 375;
  line-height: 20px;
  color: ${({ theme }) => theme?.message || Colors.NEUTRAL_80};
`;

export const DetailMessageReskin = styled.p<ThemeProps>`
  font-family: ${Fonts.SECONDARY};
  font-size: 14px;
  font-weight: 400;
  line-height: 140%;
  padding-left: 12px;
  color: ${({ theme }) => theme?.title};
`;

export const StartTrialButton = styled(ButtonMaterial)`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const CheckboxWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 8px;
`;

export const CheckboxWrapperReskin = styled.div`
  margin-top: 8px;
  label {
    margin-left: 0px;
  }
  input {
    width: 0;
    height: 0;
  }
  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const CheckboxLabel = styled.span<ThemeProps>`
  color: ${({ theme }) => theme?.checkboxLabel || Colors.NEUTRAL_80};
`;

export const CheckboxLabelReskin = styled.span<ThemeProps>`
  font-family: ${Fonts.SECONDARY};
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  color: ${({ theme }) => theme?.title};
  margin-left: 8px;
  ${mediaQuery.md`
    font-size: 16px;
  `}
`;
