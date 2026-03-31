import styled from 'styled-components';

import { Colors } from 'constants/styles';

export const Container = styled.div`
  background: ${Colors.WARNING_50};
  width: 13px;
  height: 13px;
  border: 1px solid ${Colors.PRIMARY_10};
  border-radius: 99px;
  display: flex;
  justify-content: center;
  align-items: center;
`;
