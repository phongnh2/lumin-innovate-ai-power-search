import styled from 'styled-components';

export const StyledStar = styled.img`
  ${(props) => `
    width: ${props.size}px;
    height: ${props.size}px;
  `}
`;
export const StyledWrapperStar = styled.div`
  display: flex;
  ${StyledStar} {
    &:not(:last-child) {
      margin-right: 4px;
    }
  }
`;
