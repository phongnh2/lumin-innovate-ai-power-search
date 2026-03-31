import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonIcon from 'luminComponents/Shared/ButtonIcon';

export const Wrapper = styled.div`
  width: 100%;
  position: relative;
`;

export const Title = styled.h3`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  text-transform: capitalize;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const Content = styled.div`
  margin-top: 24px;
  ${mediaQuery.md`
    margin-top: 32px;
  `}
`;

export const Button = styled(ButtonIcon)`
  background-color: ${Colors.NEUTRAL_5};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
