import { typographies } from 'lumin-ui/tokens';
import styled from 'styled-components';

export const OutlineModalWrapper = styled.div`
  padding: var(--kiwi-spacing-1);
`;

export const OutlineModal = styled.div`
  padding: var(--kiwi-spacing-1);
  border-radius: var(--kiwi-border-radius-md);
  background: var(--kiwi-colors-surface-surface-container);
`;

export const Wrapper = styled.div`
  margin-bottom: var(--kiwi-spacing-1);
`;

export const Title = styled.p`
  ${typographies.kiwi_typography_title_sm};
  color: var(--kiwi-colors-surface-on-surface);
`;

export const Label = styled.span`
  ${typographies.kiwi_typography_label_sm};
  margin-bottom: var(--kiwi-spacing-0-5);
  color: var(--kiwi-colors-surface-on-surface-variant);
`;

export const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--kiwi-spacing-1);
`;
