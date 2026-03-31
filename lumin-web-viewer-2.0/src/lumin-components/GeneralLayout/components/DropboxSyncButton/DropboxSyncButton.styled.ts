import styled from 'styled-components';

import { typographies } from 'constants/styles/editor';

export const DropboxContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 8px;
`;

export const SyncStatus = styled.span<{ $disabled: boolean }>`
  ${{ ...typographies.le_label_large }};
  ${({ theme, $disabled }) => `
    color: ${$disabled ? theme.le_disable_on_container : theme.le_main_primary};
  `}
`;