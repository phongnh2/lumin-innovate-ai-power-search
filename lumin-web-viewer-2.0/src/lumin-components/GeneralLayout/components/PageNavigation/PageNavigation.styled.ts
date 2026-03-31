import styled from 'styled-components';
import { typographies } from 'constants/styles/editor';
import { mediaQueryDown } from 'utils/styles/mediaQuery';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import BasePaper from '@new-ui/general-components/Paper';

export const Container = styled.div`
  position: absolute;
  bottom: 0;
  transition: all var(--focus-mode-transition);
`;

export const Paper = styled(BasePaper)`
  transition: all var(--editor-transition);
  ${mediaQueryDown.sm`
    max-width: 195px;
    height: fit-content;
  `}
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 16px;
  right: 50%;
  transform: translateX(50%);
  z-index: var(--zindex-page-navigation);
  opacity: 0.7;
  background: var(--kiwi-colors-surface-surface-bright);
  &[data-active='true'] {
    opacity: 1;
  }
`;

export const Wrapper = styled.div`
  ${({...typographies.le_body_small})}
  padding: 6px 8px;
  width: 100%;
  display: inline-flex;
  align-items: center;

  ${mediaQueryDown.sm`
    flex-direction: column;
    height: 100%;
  `}
`;

export const CustomDivider = styled(Divider)`
  margin: 0 4px;
  height: 16px;
  ${mediaQueryDown.sm`
    display: none;
  `}
`;
