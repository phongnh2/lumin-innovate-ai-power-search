import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import MaterialPopper from 'lumin-components/MaterialPopper';

import { Colors, Shadows } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const ButtonAdd = styled(ButtonMaterial)`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  border-color: ${Colors.NEUTRAL_60};
  &:disabled {
    border-color: ${Colors.NEUTRAL_40};
  }
  [class^='icon-'] {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: ${Colors.SECONDARY};
  }
`;

export const ButtonAddWrapper = styled.div`
  width: calc(100% / 6 - 12px);
  height: 0;
  padding: 0 0 calc(100% / 6 - 12px) 0;
  display: flex;
  margin: 6px;
  position: relative;
  box-sizing: border-box;
  ${mediaQuery.md`
    width: calc(100% / 8 - 12px);
    padding: 0 0 calc(100% / 8 - 12px) 0;
  `}
`;

export const PopperChildWrapper = styled.div`
  padding: 16px;
  ${mediaQuery.md`
    padding: 24px;
  `}
`;

export const Footer = styled.div`
  padding-top: 16px;
  border-top: 1px solid ${Colors.NEUTRAL_20};
`;

export const Popper = styled(MaterialPopper)`
  z-index: 1301 !important;
  .Popper__styleContent {
    border: none;
    box-shadow: ${Shadows.SHADOW_XL}
  }
`;
