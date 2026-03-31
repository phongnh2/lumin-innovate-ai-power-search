import { Colors } from 'constants/styles';
import styled from 'styled-components';

export const Overlay = styled.div`
  background-color: ${Colors.BACKGROUND_OVERLAY};
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  right: 0;
  z-index: 120;
  &[data-reskin='true'] {
    background-color: var(--kiwi-colors-add-on-scrim);
    opacity: var(--kiwi-opacity-scrim-default);
  }
`;

export const Wrapper = styled.div`
  position: relative;
  z-index: 121;
`;
