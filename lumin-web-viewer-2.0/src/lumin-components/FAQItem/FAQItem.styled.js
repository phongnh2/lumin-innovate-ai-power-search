import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.li`
  font-family: ${Fonts.PRIMARY};
  border-top: 1px solid ${Colors.NEUTRAL_20};
  margin-bottom: 18px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  &:first-child {
    ${mediaQuery.md`
      border-top: none;
    `};
  }

  &:last-child {
    padding-bottom: 18px;
    margin-bottom: 0;
    ${mediaQuery.md`
      padding-bottom: 24px;
    `};
  }
  ${mediaQuery.md`
    margin-bottom: 24px;
  `};
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  ${mediaQuery.md`
    padding-top: 24px;
  `}
`;

export const Text = styled.p`
  max-width: 85%;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin: 0;

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}

  ${mediaQuery.xl`
    font-size: 20px;
    line-height: 28px;
  `}
`;

export const AnswerWrapper = styled.div`
  overflow: hidden;
  max-height: 0;
  transition: all 0.3s ease;
`;

export const Answer = styled.div`
  max-width: 85%;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;

  a {
    color: ${Colors.SECONDARY_50};
    text-decoration: underline;
  }

  p {
    margin: 0;
  }
`;
