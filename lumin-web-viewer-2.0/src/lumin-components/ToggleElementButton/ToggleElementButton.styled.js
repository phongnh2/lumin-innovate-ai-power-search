import styled from 'styled-components';

import { Colors } from 'constants/styles';

export const themes = {
  light: {
    icon: {
      active: Colors.PRIMARY_90,
    },
    toggleButton: {
      normal: Colors.NEUTRAL_20,
    },
  },
  dark: {
    icon: {
      active: Colors.NEUTRAL_40,
    },
    toggleButton: {
      normal: Colors.NEUTRAL_90,
    },
  },
};

export const Wrapper = styled.div`
  position: relative;
  margin-left: 6px;
  border-radius: var(--border-radius-dense);
  &.active {
    .icon {
      color: ${(props) => props.theme.icon.active || themes.light.icon.active};
    }
    .ToggleElementButton {
      background-color: ${(props) => props.theme.toggleButton.normal || themes.light.toggleButton.normal};
    }
  }
`;
