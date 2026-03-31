import { typographies } from 'lumin-ui/dist/design-tokens/kiwi/js';
import { Modal as KiwiModal } from 'lumin-ui/kiwi-ui';
import styled from 'styled-components';

import { spacings, typographies as leTypographies } from 'constants/styles/editor';

export const Modal = styled(KiwiModal)`
  .mantine-Modal-header {
    display: flex;
  }
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_2}px;
`;

export const Title = styled.span`
  ${typographies.kiwi_typography_headline_lg};
  color: var(--kiwi-colors-surface-on-surface);
`;

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const SubTitle = styled.span`
  ${typographies.kiwi_typography_label_md};
  color: var(--kiwi-colors-surface-on-surface-variant);
`;

export const PopperContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

export const PopperContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.le_gap_0_5}px;
`;

export const PopperTitle = styled.span`
  ${{ ...leTypographies.le_body_large }};
  ${({ theme }) => `
    color: ${theme.le_main_on_surface}
  `};
  gap: ${spacings.le_gap_0_5}px;
`;

export const DropdownIconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const PopoverContainer = styled.div`
  width: 592px;
`;

export const WarningContent = styled.div`
  ${typographies.kiwi_typography_body_md};
  color: var(--kiwi-colors-semantic-on-warning-container);
  background-color: var(--kiwi-colors-semantic-warning-container);
  display: flex;
  gap: ${spacings.le_gap_1}px;
  border-radius: 8px;
  padding: ${spacings.le_gap_1_5}px ${spacings.le_gap_1}px;
`;

export const FooterContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacings.le_gap_2}px;
`;
