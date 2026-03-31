import styled from 'styled-components';

import { TEMPLATE_RATIO } from 'constants/templateConstant';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  position: relative;
  padding-top: ${() => `calc(100% * ${TEMPLATE_RATIO})`};
  border-radius: var(--border-radius-primary);
  overflow: hidden;
`;

export const Body = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${Colors.NEUTRAL_10};
`;
