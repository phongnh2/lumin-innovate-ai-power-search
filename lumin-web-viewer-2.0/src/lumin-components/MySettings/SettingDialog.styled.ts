import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonIcon from 'luminComponents/Shared/ButtonIcon';

export const HeaderContainer = styled.div`
  position: sticky;
  top: 0;
  background-color: ${Colors.WHITE};
  z-index: 2;
  padding: 16px 16px 0;
  min-height: 40px;
  ${mediaQuery.md`
    padding: 16px 32px 0;
  `}
`;

export const Header = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  ${mediaQuery.md`
    margin-right: -16px;
  `}
`;

export const Title = styled.h2`
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const TabContainer = styled.div`
  margin-top: 24px;
  padding: 0 16px 16px;
  ${mediaQuery.md`
    padding: 0 32px 32px;
    margin-top: 32px;
  `}
`;

export const Button = styled(ButtonIcon)`
  background-color: ${Colors.NEUTRAL_5};
`;