import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import SharedInput from 'lumin-components/Shared/Input';
import Alert from 'luminComponents/Shared/Alert';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import PaymentMethodInfoForm from 'luminComponents/PaymentMethodInfo/PaymentMethodInfoForm';

type InputBoxProps = {
  $margin: boolean;
  $error: boolean;
  $focus: boolean;
  $disabled: boolean;
}

type ButtonIconProps = {
  icon: string;
  iconSize: number;
  iconColor: string;
  onClick: () => void;
}

export const Wrapper = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};

  ${mediaQuery.md`
    margin-top: 24px;
    padding-top: 24px;
  `}
`;

export const LoadingWrapper = styled.div<{$isReskin: boolean}>`
  padding: ${(props)=>props.$isReskin ? "78px 0" : "60px 0"};
`;

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const BillingEmailWrapper = styled.div`
  margin-top: 16px;
`;

export const InputLabelWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 400px;
`;

export const InputLabel = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
`;

export const InputAction = styled.label`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.SECONDARY_50};
  text-decoration: underline;
  cursor: pointer;
  text-align: right;

  ${mediaQuery.md`
    margin-left: 24px;
  `}
`;

export const BillingEmailContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4px;
`;

export const InputContainer = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;

export const Input = styled(SharedInput)<{ value: string, disabled: boolean }>`
  ${mediaQuery.md`
    min-width: 400px;

    input {
      padding: 0 16px;
    }
  `}
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;

  ${mediaQuery.md`
    max-width: 400px;
  `}
`;

export const Divider = styled.div<{ $isError?: boolean }>`
  width: 100%;
  border-top: 1px solid ${Colors.NEUTRAL_20};
  margin: 16px 0;

  ${mediaQuery.md`
    margin-top: 24px;
    margin-bottom: ${({ $isError }: { $isError: boolean }) => $isError ? 16 : 24}px; 
  `}
`;

export const CreditCardWrapper = styled.div<{ $isChangingCard: boolean }>`
  margin-top: 16px;

  ${({ $isChangingCard }) => $isChangingCard && `
    margin-top: 0px;
  `}
`;

export const CreditCardContainer = styled.div<{ $isChangingCard: boolean }>`
  display: flex;
  flex-direction: row;
  margin-top: 4px;

  ${({ $isChangingCard }) => $isChangingCard && `
    flex-direction: column;
  `}
`;

export const PaymentElementContainer = styled.div`
  max-width: 400px;
`;

export const CreditCardGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 16px;

  ${mediaQuery.md`
    max-width: 400px;
  `}
`;

export const InputBox = styled.div<InputBoxProps>`
  height: 48px;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 16px;
  padding-right: 5px;
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: 8px;
  box-sizing: border-box;

  ${({ $margin }) => $margin && `
    margin-top: 4px;
  `}

  ${({ $error }) => $error && `
    border-color: ${Colors.SECONDARY_50};
  `}

  ${({ $focus }) => $focus && `
    border-color: ${Colors.PRIMARY_50};
    box-shadow: 0 0 0 1.2px var(--color-primary-30);
  `}

  ${({ $disabled }) => $disabled && `
    background: ${Colors.NEUTRAL_10};
    border: 1px solid ${Colors.NEUTRAL_20};
  `}

  ${mediaQuery.md`
    max-width: 400px;
  `}
`;

export const StripeCard = styled.div`
  width: 100%;
  height: fit-content;
`;

export const InputLogo = styled.div`
  width: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
`;

export const InputError = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.SECONDARY_50};
  margin-top: 4px;
`;

export const WrongCardAlert = styled(Alert)`
  width: 100%;
  margin-bottom: 16px;
`;

export const RemoveButton = styled(ButtonIcon)<ButtonIconProps>`
  height: 48px;
  min-width: 48px;
  margin-left: 12px;
  background-color: ${Colors.NEUTRAL_10};

  &:hover {
    background-color: ${Colors.NEUTRAL_20};
  }
`;

export const ButtonAddCard = styled(ButtonMaterial)`
  width: 400px;
  margin-top: 4px;
`;

export const AddCardText = styled.p`
  margin-left: 12px;
`;

export const ChargedPaymentMethodInfoForm = styled(PaymentMethodInfoForm)`
  max-width: 400px;
  flex: 1;
`