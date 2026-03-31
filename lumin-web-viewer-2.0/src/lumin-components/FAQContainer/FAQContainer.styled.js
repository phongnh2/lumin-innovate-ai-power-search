import styled from 'styled-components';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.section`
  background-color: ${Colors.WHITE};
  padding: 32px 0;

  ${mediaQuery.md`
    padding-top: 56px;
  `}

  ${mediaQuery.xl`
    padding-top: 80px;
  `}
`;

export const Wrapper = styled.div`
  padding: 0 16px;
  margin: 0 auto;

  ${mediaQuery.md`
    padding: 0 48px;
  `}

  ${mediaQuery.xl`
    max-width: 926px;
    padding: 0;
  `}
`;

export const Title = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  margin: 0 0 32px;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
    margin: 0 0 20px;
  `}

  ${mediaQuery.xl`
    font-size: 32px;
    line-height: 48px;
    margin: 0 0 32px;
  `}
`;

export const Content = styled.div`
  padding-bottom: 0px;
`;

export const List = styled.ul`
  padding: 0;
  margin: 0;
  list-style: none;
`;
