import styled from 'styled-components';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import { Colors } from 'constants/styles';

export const NoteAvatarContainer = styled.div`
  position: relative;
`;

export const StyledMaterialAvatar = styled(MaterialAvatar)`
  &.NoteAvatar {
    border: 1px solid ${Colors.NEUTRAL_20};
  }
`;

export const IconAnnotation = styled.div`
  position: absolute;
  bottom: -5px;
  right: -5px;
  width: 16px;
  height: 16px;
  background-color: ${Colors.PRIMARY_30};
  border-radius: 50%;
  border: 1px solid  #FFF;
  display: flex;
  align-items: center;
  justify-content: center;
`;
