import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors, BorderRadius } from 'constants/styles';
import { THEME_MODE } from 'constants/lumin-common';


const lightTheme = {
   BACKGROUND_IN_MODAL: Colors.LIGHT_PURPLE,
   BACKGROUND_IN_MODAL_HOVER: Colors.PURPLE,
   TEXT: Colors.NEUTRAL_80,
   TEXT_HOVER: Colors.NEUTRAL_100
};

const darkTheme = {
  BACKGROUND_IN_MODAL: Colors.NEUTRAL_90,
  BACKGROUND_IN_MODAL_HOVER: Colors.NEUTRAL_90,
  TEXT: Colors.NEUTRAL_20,
  TEXT_HOVER: Colors.NEUTRAL_10,
};

export const theme: Record<string, unknown> = {
  [THEME_MODE.LIGHT]: lightTheme,
  [THEME_MODE.DARK]: darkTheme,
};

export const Wrapper = styled.div`
  width: 100%;
  border-radius: ${BorderRadius.PRIMARY};
  display: flex;
  flex-direction: column;
`;

export const SignatureModalIntegration = styled(ButtonMaterial)`
  && {
    width: 100%;
    padding: 12px 16px;
    height: 60px;
    border-radius: ${BorderRadius.PRIMARY};
    display: flex;
    flex-direction: row;
    margin: 8px 0 16px 0;
    justify-content: flex-start;
    background-color: ${({ theme }) => theme.BACKGROUND_IN_MODAL};
    color:  ${({ theme }) => theme.TEXT};
    &:hover {
      background-color: ${({ theme }) => theme.BACKGROUND_IN_MODAL_HOVER};
      color:  ${({ theme }) => theme.TEXT_HOVER};
      box-shadow: 0px 1px 3px 1px rgba(255, 255, 255, 0.16), 0px 1px 16px 0px rgba(255, 255, 255, 0.20);
    }
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 8px;
  align-items: flex-start;
`;

const Text = styled.span`
  font-size: 12px;
  font-style: normal;
  line-height: 16px;
`;

export const Introduction = styled(Text)`
  font-weight: 600;
  color: ${({ theme }) => theme.TEXT};
`;

export const Title = styled(Text)`
  font-weight: 600;
`;

export const Description = styled(Text)`
  font-weight: 375;
  width: 100%;
  overflow: hidden;
  white-space: normal;
  text-align: left;
`;
