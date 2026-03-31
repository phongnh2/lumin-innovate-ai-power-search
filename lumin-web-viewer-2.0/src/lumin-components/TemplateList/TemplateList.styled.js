import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';
import * as TemplateGridStyled from 'lumin-components/TemplateGrid/TemplateGrid.styled';

export const Container = styled.div`
  padding: ${(props) => (props.$isOrgPage ? '0' : '16px')};
  padding-bottom: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  ${mediaQuery.md`
    padding: ${(props) => (props.$isOrgPage ? '0' : '24px')};
    padding-bottom: 32px;
  `}
  ${mediaQuery.xl`
    padding: 0;
    padding-bottom: 32px;
  `}

  ${TemplateGridStyled.Container} {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: space-between;
  }
`;
