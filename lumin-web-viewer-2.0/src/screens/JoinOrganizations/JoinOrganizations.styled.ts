import styled from 'styled-components';
import * as Styled from '../JoinOrganization/JoinOrganization.styled';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const List = styled(Styled.List)`
  max-height: 100%;
`;

export const Container = styled(Styled.Container)`
  height: calc(100vh - var(--header-secondary-height));
`;

export const Paper = styled(Styled.Paper)`
  display: flex;
  flex-direction: column;
  text-align: center;
  ${mediaQuery.md`
    margin-top: 0;
  `}

  ${mediaQuery.xl`
    margin-top: 16px;
  `}
`;

export const Title = styled(Styled.Title)`
  font-size: 20px;
  line-height: 28px;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const ButtonGroup = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  ${mediaQuery.md`
    flex-direction: row;
  `}
`;

export const Link = styled.a`
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