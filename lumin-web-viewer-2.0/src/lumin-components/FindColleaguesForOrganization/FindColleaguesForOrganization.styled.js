import styled from 'styled-components';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const Label = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 40px;
  `}

  b {
    font-weight: 600;
  }
`;

export const Description = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 16px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
    margin-top: 24px;
  `}

  b {
    font-weight: 600;
  }
`;

export const InputWrapper = styled.div`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 16px;
  align-items: center;

  ${mediaQuery.md`
    flex-direction: row;
    margin-top: 24px;
  `}
`;

export const Link = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_70};
  margin-top: 16px;
  cursor: pointer;

  &:hover {
    text-decoration-line: underline;
  }

  ${mediaQuery.md`
    margin-top: 0;
    margin-left: 24px;
  `}
`;
