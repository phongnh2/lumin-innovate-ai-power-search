import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${Colors.NEUTRAL_10};
`;

export const Container = styled.div`
  width: 100%;
  max-width: 486px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 16px auto 0;
  padding: 0 16px 16px;

  ${mediaQuery.md`
    margin-top: 24px;
    padding: 0;
  `}
`;

export const StepWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

export const Content = styled.div`
  width: 100%;
  margin-top: 48px;

  ${mediaQuery.md`
    margin-top: 58px;
  `}
`;
