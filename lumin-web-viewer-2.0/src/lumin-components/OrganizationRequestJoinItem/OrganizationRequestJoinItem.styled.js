import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  padding: 8px 16px;
  box-sizing: border-box;
`;
export const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${Colors.SECONDARY_10};
`;
export const AvatarContainer = styled.div`
  margin-bottom: 8px;
`;

export const ListItem = styled.div`
  display: grid;
  grid-template-columns: min-content minmax(0, 1fr) 16px;
  column-gap: 8px;
  align-items: center;
  transition: background-color 0.3s ease;
  position: relative;
  &:before {
    content: "";
    display: block;
    height: 100%;
    width: 4px;
    position: absolute;
    top: 0;
    left: -2px;
  }
`;
export const ItemBody = styled.div`

`;

export const ButtonRequest = styled(ButtonMaterial)`
  width: 100%;
  margin-top: 16px;
`;
export const Divider = styled.div`
  height: 1px;
  width: 100%;
  background-color: ${Colors.NEUTRAL_20};
  margin: 8px 0;
`;
