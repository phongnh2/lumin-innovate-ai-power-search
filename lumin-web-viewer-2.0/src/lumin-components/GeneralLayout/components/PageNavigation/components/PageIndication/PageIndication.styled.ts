import { typographies } from 'lumin-ui/tokens';
import styled, { css } from 'styled-components';

import InputButton from '../InputButton';

export const PageNumberWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-width: 0;
  gap: var(--kiwi-spacing-0-5);
`;

export const Wrapper = styled.div`
  padding: 6px 8px;
  width: 100%;
  display: flex;
  align-items: center;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 135%;
  letter-spacing: 0.36px;
`;

export const PageDetail = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  gap: var(--kiwi-spacing-0-5);
`;

const TextStyles = css`
  ${typographies.kiwi_typography_label_sm};
  color: var(--kiwi-colors-surface-on-surface);
`;

export const TotalPages = styled.span`
  user-select: none;
  ${TextStyles}
`;

export const PageNumberInput = styled(InputButton)`
  && {
    .LuminInput__input {
      min-width: 40px;
      padding: var(--kiwi-spacing-0-5);
      text-align: center;
      border-radius: var(--kiwi-border-radius-md);
      width: fit-content;
    }
  }
`;
