import styled, { css } from 'styled-components';

import ButtonMaterial, { ButtonSize } from 'luminComponents/ButtonMaterial';
import { IButtonSize } from 'utils/styles/SizeTransformer';

export interface IButtonProps {
  $isLongText: boolean;
  $size: IButtonSize;
  $isEnglish: boolean;
}

export const Button = styled(ButtonMaterial)<IButtonProps>`
  ${({ $size, $isLongText, $isEnglish }) => {
    if ($isEnglish) {
      return css`
        white-space: nowrap;
      `;
    }
    return css`
      ${$isLongText && 'white-space: normal;'}
      ${[ButtonSize.MD as IButtonSize, ButtonSize.SM].includes($size) && $isLongText && `
        font-size: 12px;
        line-height: 16px;
      `}
    `;
  }}
`;

