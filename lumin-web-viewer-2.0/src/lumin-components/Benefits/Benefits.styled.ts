import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import Icomoon from 'lumin-components/Icomoon';

export const Container = styled.div`
  display: flex;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  ${mediaQuery.md`
    margin-bottom: 12px;
  `}
`;

export const IconWrapper = styled(Icomoon)`
  width: 16px;
  height: 16px;
  margin-right: 14px;

  ${mediaQuery.xl`
    margin-right: 12px;
  `}
`;

export const Text = styled.div`
  font-weight: 375;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
`;
