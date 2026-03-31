import Paper from 'lumin-components/GeneralLayout/general-components/Paper';
import styled from 'styled-components';

const renderStyle = (allowDrag, theme) => {
  if (!allowDrag) {
    return `
    `;
  }

  if (allowDrag === 'left') {
    return `
      padding: 0px 0px 0px 8px;
      &::after {
        display: block;
        top: 50%;
        transform: translateY(-50%);
        left: 4px;
        height: 24px;
        width: 2px;
      }
    `;
  }

  if (allowDrag === 'top') {
    return `
      padding: 8px 0px 0px 0px;
      &::after {
        display: block;
        left: 50%;
        transform: translateX(-50%);
        top: 4px;
        height: 2px;
        width: 24px;
      }
    `;
  }
};

export const AnnotationPopupWrapper = styled(Paper)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: fit-content;
  z-index: 202;
  position: fixed;
  padding: 8px;
  filter: none;

  ${({ $allowDrag, theme }) => `
    &::after {
    content: '';
    position: absolute;
    display: none;
    border-radius: 999px;
    background-color: ${theme.le_main_outline_variant};
    z-index: 1;
  }

    ${renderStyle($allowDrag, theme)}
  `}
  ${({ $open }) =>
    $open
      ? `
        visibility: visible;
        opacity: 1;
    `
      : `
        visibility: hidden;
        opacity: 0;
    `}
`;
