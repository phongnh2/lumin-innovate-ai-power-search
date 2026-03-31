import styled from 'styled-components';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const FooterContainer = styled.div`
  display: flex;
  border-top: 1px solid ${Colors.NEUTRAL_20};
  justify-content: flex-end;
  padding: 12px 16px;
  gap: 16px;
  ${mediaQuery.md`
    padding: 16px 24px;
  `}
`;

export const FooterContainerReskin = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: var(--kiwi-spacing-2) var(--kiwi-spacing-3);
  gap: var(--kiwi-spacing-2);
`;

export const Button = styled(ButtonMaterial)`
  padding: 0 61px;
`;