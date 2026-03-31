import styled, { css } from 'styled-components';
import { Link as RouterLink } from 'react-router-dom';
import { Colors } from 'constants/styles';
import { Button as ButtonBase } from 'lumin-ui/kiwi-ui';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import Icomoon from 'lumin-components/Icomoon';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { spacings, typographies } from 'constants/styles/editor';
import IconButton from '@new-ui/general-components/IconButton';

export const canClose = (props: any) => props.closable;

export const Container = styled.div<{background?: string}>`
  background-color: ${(props) => props.background || Colors.PRIMARY_90};
  width: 100%;
  display: flex;
  flex-shrink: 0;
  flex-direction:row;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  box-sizing: border-box;
  position: relative;
  ${mediaQuery.md`
    flex-direction: row;
    padding-right: ${(props) => (canClose(props) ? 64 : 16)}px;
    justify-content: center;
  `}
`;

export const ContainerNewLayout = styled(Container)`
  background: ${(props) => props.theme.le_main_surface_container};
  gap: ${spacings.le_gap_2}px;
`;

export const Text = styled.span<{color?: string}>`
  font-size: 12px;
  color: ${(props) => props.color || Colors.WHITE};
  line-height: 16px;
  font-weight: 600;
  vertical-align: middle;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    padding-right: 0;
  `}
  b {
    color: var(--kiwi-colors-semantic-error);
  }
`;

export const TextNewLayout = styled.p`
  ${typographies.le_body_medium}
  color: ${props => props.theme.le_main_on_surface};
  span {
    color: ${props => props.theme.le_main_on_surface_variant};
  }
`;

export const Link = styled(RouterLink)`
  color: ${Colors.WHITE};
  font-size: 14px;
  font-weight: 600;
`;
export const Button = styled(ButtonMaterial)`
  width: fit-content;
  min-width: auto;
  white-space: nowrap;
  ${mediaQuery.xl`
    flex: 1;
  `}

  ${Link} {
    padding: 0;
  }

  &.danger-outline {
    background: none;
  }
`;

export const ButtonNewLayout = styled(ButtonBase)`
  background: ${(props) => props.theme.le_main_on_surface};
  flex-shrink: 0;
  &:hover {
    background: ${(props) => props.theme.le_main_on_surface};
  }
  color: ${(props) => props.theme.le_main_inverse_on_surface};
`;

export const ButtonGroup = styled.div`
  width: 40%;
  display: flex;
  align-items: center;
  ${mediaQuery.md`
    margin-top: 0;
    margin-left: 16px;
    width: auto;
  `}
  ${mediaQuery.xl`
    margin-left: 16px;
  `}

  ${Button} {
    &:not(:first-child) {
      margin-left: 12px;
    }
  }
`;
export const IconDownload = styled(Icomoon)`
  display: none;
  margin-right: 12px;
  ${mediaQuery.md`
    display: block;
  `}
`;
export const CloseButton = styled.div`
  width: 20px;
  height: 20px;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
  z-index: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  ${mediaQuery.md`
    width: 24px;
    height: 24px;
    top: 50%;
    transform: translate3d(0, -50%, 0);
  `}
`;

export const CloseIconButton = styled(IconButton)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 16px;
`;

export const Speaker = styled.img`
  display: none;
  ${mediaQuery.md`
    display: inline;
    margin-right: 4px;
    width: 24px;
    height: 24px;
  `}
`;
export const TextContainer = styled.div<{ $noSpacing?: boolean }>`
  display: flex;
  padding-right: ${(props) => (canClose(props) ? 40 : 8)}px;
  
  ${(props) =>
  props.$noSpacing &&
  css`
    padding: 0;
  `}
`;
