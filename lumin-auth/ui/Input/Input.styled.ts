import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { ErrorMessage } from '../ErrorMessage';
import Icomoon from '../Icomoon';
import { BorderRadius, Colors } from '../theme';

import { Label } from './components';

interface IInputStyled {
  icon?: any;
  extendRightGap?: boolean;
  error?: string;
}

export const Error = styled(ErrorMessage)``;

export const InputIcon = styled(Icomoon)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 20px;
  color: ${Colors.NEUTRAL_60};
`;

export const IconRightWrapper = styled.span`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
  align-items: center;
  display: flex;
  [class^='icon'] {
    display: none;
  }
`;

export const PasswordIcon = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 4px;
  padding: 4px;
  i {
    color: ${Colors.NEUTRAL_60};
  }

  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;

export const Input = styled.input<{ emotion: IInputStyled }>`
  --box-shadow-fixed: 0 0 0 1000px white inset;
  border: 1px solid ${Colors.NEUTRAL_30};
  border-radius: ${BorderRadius.Primary};
  height: 48px;
  width: 100%;
  outline: none;
  padding-left: ${({ emotion }) => (emotion.icon ? '48px' : '12px')};
  padding-right: ${({ emotion }) => (emotion.extendRightGap ? '44px' : '12px')};
  transition: all 0.25s ease;
  color: ${Colors.NEUTRAL_100};
  -webkit-text-fill-color: ${Colors.NEUTRAL_100}; /* required on iOS, safari */

  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    appearance: textfield;
  }

  &:focus {
    border-color: ${Colors.PRIMARY_50};
    box-shadow: 0 0 0 1.2px ${Colors.PRIMARY_30};

    & ~ i {
      color: ${Colors.NEUTRAL_100};
    }
  }

  &::placeholder {
    color: ${Colors.NEUTRAL_30};
    -webkit-text-fill-color: ${Colors.NEUTRAL_30}; /* required on iOS, safari */
  }

  &:not(:placeholder-shown) {
    & ~ ${IconRightWrapper} {
      [class^='icon'] {
        display: block;
      }
    }
  }

  &:-webkit-autofill {
    -webkit-text-fill-color: ${Colors.NEUTRAL_100};
    box-shadow: 0 0 0 1000px #fff inset;
    transition: background-color 5000s ease-in-out 0s;

    &:disabled {
      -webkit-text-fill-color: ${Colors.NEUTRAL_60};
      box-shadow: 0 0 0 1000px rgb(192 208 223 / 20%) inset;
      transition: all 0s ease 0s;
    }
  }

  &:disabled {
    cursor: not-allowed;
    background-color: ${Colors.NEUTRAL_10};
    border-color: ${Colors.NEUTRAL_20};
    color: ${Colors.NEUTRAL_60};
    -webkit-text-fill-color: ${Colors.NEUTRAL_60}; /* required on iOS, safari */
  }

  &:-webkit-autofill {
    box-shadow: var(--box-shadow-fixed);
  }

  ${({ emotion }) =>
    emotion.error &&
    css`
      border-color: ${Colors.SECONDARY_50};
    `}
`;

export const InputContainer = styled.div`
  position: relative;
`;

export const InputLabel = styled(Label)`
  margin-bottom: 4px;
`;
