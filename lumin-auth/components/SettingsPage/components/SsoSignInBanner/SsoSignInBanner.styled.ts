import styled from '@emotion/styled';

import { Colors } from '@/ui/theme/color';

export const Container = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
  border-radius: 8px;
  border: 1px solid ${Colors.PRIMARY_40};
  background: ${Colors.PRIMARY_20};
  cursor: default;
`;

export const LeftSection = styled.div`
  display: flex;
  align-items: center;
  width: 24px;
  height: auto;
`;
