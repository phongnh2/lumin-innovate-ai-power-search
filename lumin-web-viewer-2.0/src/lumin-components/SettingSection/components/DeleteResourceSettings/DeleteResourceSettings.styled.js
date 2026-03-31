import { Colors } from 'constants/styles';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import styled from 'styled-components';

export const DeleteButton = styled(ButtonMaterial)`
  margin-top: 16px;
  &:hover {
    color: ${Colors.WHITE};
    background-color: ${Colors.SECONDARY_50};
    border-color: ${Colors.SECONDARY_50};
  }
`;
