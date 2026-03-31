import { Button as KiwiButton } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import { typographies, spacings } from 'constants/styles/editor';

export const Container = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 16px;
  z-index: 2;
  backdrop-filter: blur(16px);
  ${({ theme }) => `
    background-color: ${theme.le_state_layer_on_surface_hovered};
  `};
`;

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  ${({ ...typographies.le_title_small })}
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.le_main_on_surface};
  padding: 0 ${spacings.le_gap_5}px;
  `;

export const WrapperButtons = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: ${spacings.le_gap_2}px;
  align-items: center;
  gap: ${spacings.le_gap_2}px;
  width: 100%;
`;

export const Button = styled(KiwiButton)`
  flex: 1;
`;
