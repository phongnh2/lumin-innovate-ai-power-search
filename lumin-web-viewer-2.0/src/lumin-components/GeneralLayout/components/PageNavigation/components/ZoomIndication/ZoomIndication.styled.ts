import styled from 'styled-components';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';
import { typographies } from 'constants/styles/editor';
import InputButton, { InputType } from '../InputButton';

type ZoomButtonProps = {
  disabled: boolean;
  onClick: Function;
  icon: string;
  iconSize?: number;
  tooltipData: object
}


export const ZoomLevelWrapper = styled.div`
  max-width: 124px;
  height: 32px;
  display: flex;
  align-items: center;
  gap: var(--kiwi-spacing-0-5);
`;

export const ZoomButton = styled(IconButton)<ZoomButtonProps>`
  width: 32px;
  height: 32px;
`;

export const CustomDivider = styled(Divider)`
  margin: 0 4px;
  height: 16px;
`;

export const Input = styled(InputButton)`
  && {
    .LuminInput__input {
      text-align: center;
    }
  }
`;
