import { Colors, Fonts } from 'constants/styles';
import styled from 'styled-components';

export const Container = styled.div`
  && .CurrencyPicker__value {
    font-size: 14px;
    color: ${(props) => (props.$readOnly ? 'var(--color-neutral-80)' : 'var(--color-neutral-100)')};
  }
`;

export const ContainerReskin = styled.div`
  && .CurrencyPicker__value {
    font-size: 14px;
    color: ${(props) => (props.$readOnly ? 'var(--color-neutral-80)' : 'var(--color-neutral-100)')};
  }

  .CurrencyPicker__container {
    height: 40px;
    border: 1px solid ${Colors.GRAY_3};

    .icon-arrow-up {
      transform: rotate(-180deg);
    }
  }

  .MaterialSelect--focus.CurrencyPicker__container {
    border: 1px solid var(--color-primary-50);
  }

  .CurrencyPicker__input .MaterialSelect__value {
    font-family: ${Fonts.SECONDARY};
    font-size: 14px;
    font-weight: 500;
    line-height: 140%;
    color: ${Colors.LUMIN_SIGN_PRIMARY};
  }
`;
