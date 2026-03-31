import styled from 'styled-components';

import * as TempBillingStyled from 'lumin-components/PaymentTempBilling/PaymentTempBilling.styled';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts, Shadows } from 'constants/styles';

export const Container = styled(TempBillingStyled.Container)`
  margin: 0;
`;

export const ContainerReskin = styled(TempBillingStyled.Container)`
  margin: 0;
  height: fit-content;
  box-shadow: ${Shadows.SHADOW_LIGHT_DIALOG_RESKIN};
  background: white;
  border-radius: 12px;
  overflow: hidden;
`;

export const TrialFeature = styled.div`
  position: relative;
  z-index: 1;
  margin: 16px 0 16px;
  padding: 12px 16px;
  border-radius: var(--border-radius-primary);
  overflow: hidden;
  ${mediaQuery.md`
    padding: 18px 26px;
  `}
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: ${Colors.PRIMARY_10};
    opacity: 0.8;
  }
`;

export const TrialFeatureReskin = styled.div`
  position: relative;
  z-index: 1;
  margin: 16px 0 16px;
  padding: 8px;
  border-radius: 12px;
  overflow: hidden;
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    background-color: var(--color-le-main-background);
  }
`;

export const TrialFeatureItem = styled.p`
  display: grid;
  color: ${Colors.NEUTRAL_100};
  grid-template-columns: 20px auto;
  gap: 10px;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
  font-weight: 400;
  &:not(:last-child) {
    margin-bottom: 12px;
  }
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const TrialFeatureItemReskin = styled.p`
  display: grid;
  color: ${Colors.LUMIN_SIGN_PRIMARY};
  grid-template-columns: 20px auto;
  gap: 10px;
  align-items: center;
  font-family: ${Fonts.SECONDARY};
  font-size: 12px;
  line-height: 150%;
  font-weight: 400;
  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const ButtonContainer = styled.div`
  cursor: ${(props) => (props.$disabled && 'not-allowed')};
`;

export const ButtonContainerReskin = styled.div`
  cursor: ${(props) => (props.$disabled && 'not-allowed')};

  button {
    height: 40px;
    font-family: ${Fonts.SECONDARY};
    font-weight: 500;
    font-size: 14px;
    line-height: 100%;
    padding: 8px 16px;
    background-color:  ${(props) => (props.$disabled ? Colors.OTHER_29 : Colors.OTHER_28)} !important;
  }
`;
