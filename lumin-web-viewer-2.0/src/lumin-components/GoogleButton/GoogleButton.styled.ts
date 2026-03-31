import styled from 'styled-components'

import IconGoogle from 'assets/lumin-svgs/icon-google.svg';
import IconGoogleDisabled from 'assets/lumin-svgs/icon-google-disabled.svg';

export const LogoWrapper = styled.div`
  width: 38px;
  height: 38px;
  align-items: center;
  display: flex;
  justify-content: center;
  background-color: white;
  border-radius: 1px;
  margin-right: 8px;
`;

export const Logo = styled.div`
  width: 18px;
  height: 18px;
  background: url("${IconGoogle}");
  background-size: contain;
`;

export const Button = styled.button`
  outline: none;
  border: none;
  cursor: pointer;
  height: 40px;
  font-family: 'Roboto';
  font-weight: 600;
  background-color: #4285F4;
  color: white;
  align-items: center;
  display: flex;
  padding: 0 8px 0 1px;
  border-radius: 2px;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 0 3px 3px #afc9f4;
  }
  &:active {
    background-color: #3367d6;
  }
  &:disabled {
    color: #7f7f7f;
    background-color: #d4d4d4;
    ${LogoWrapper} {
      background-color: #d4d4d4;
    }
    ${Logo} {
      background: url("${IconGoogleDisabled}");
      background-size: contain;
    }
  }
`;
