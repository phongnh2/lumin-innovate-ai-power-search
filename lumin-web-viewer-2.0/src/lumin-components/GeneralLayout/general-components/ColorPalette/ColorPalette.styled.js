import styled, { css } from 'styled-components';

export const ColorPaletteWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  ${({ $disabled }) =>
    $disabled &&
    `
    &:hover {
      cursor: not-allowed;
    }
    & > * {
      user-select: none;
      pointer-events: none;
      opacity: 0.5;
    }
  `}
`;

export const ColorCell = styled.span`
  ${({ $isFreeTextTool }) =>
    $isFreeTextTool
      ? css`
          width: 18px;
          height: 18px;
        `
      : css`
          width: 22px;
          height: 22px;
        `};
  border-radius: 9999px;
  cursor: pointer;
  border: 1px solid var(--kiwi-colors-surface-outline-variant);
  position: relative;
  &[data-disabled='true'] {
    pointer-events: none;
    opacity: 0.5;
  }

  &:after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 9999px;
  }

  &[data-active='true'] {
    outline: 1px solid var(--kiwi-colors-surface-on-surface);
    outline-offset: 2px;
  }

  &[data-no-fill='true'] {
    background-color: transparent;
    border: 1px solid var(--kiwi-colors-surface-outline-variant);
    &:before {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      top: 50%;
      left: 50%;
      /* fixed color */
      background: #f2385a;
      transform: rotate(-45deg) translate(-50%, -50%);
      transform-origin: left;
    }
  }
`;
