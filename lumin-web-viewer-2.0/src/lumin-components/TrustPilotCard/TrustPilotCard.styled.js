import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const StyledContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: ${Colors.PALEBLUE_DARKER};
  ${mediaQuery.md`
    padding: 24px;
  `}
`;

export const StyledWrapperAuthor = styled.div`
  ${mediaQuery.md`
    justify-content: space-between;
    display: flex;
  `}
`;

export const StyledAuthor = styled.div`
  height: 43px;
  display: flex;
`;

export const StyledAvatar = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  border: solid 2px ${Colors.WHITE};
  border-radius: 50%;
  box-sizing: border-box;
`;

export const StyledInfo = styled.div`
  margin-left: 12px;
  display: flex;
  flex-direction: column;
`;

export const StyledName = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-size: 18px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;  
  overflow: hidden;
  ${mediaQuery.md`
    display: block;
  `}
`;

export const StyledCountry = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-size: 16px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.34px;
  color: ${Colors.SECONDARY};
  margin: 0;
`;

export const StyledWrapperStar = styled.div`
  display: flex;
  margin-top: 20px;

  ${mediaQuery.md`
    margin-top: 0;
  `}
`;

export const StyledStar = styled.img`
  width: 24px;
  height: 24px;
`;

export const StyledLabel = styled.h5`
  font-family: ${Fonts.PRIMARY};
  font-size: 18px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.33;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
  margin: 8px 0;
  ${mediaQuery.md`
    margin: 16px 0 8px 0;
  `}
`;

export const StyledContent = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-size: 16px;
  font-weight: 400;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.34px;
  color: ${Colors.PRIMARY};
  margin: 0;
`;

export const StyledText = styled.span`
  ${({ fullContent, numOfLines }) => !fullContent && `
    display: -webkit-box;
    ${numOfLines && `-webkit-line-clamp: ${numOfLines};`}
    -webkit-box-orient: vertical;  
    overflow: hidden;
  `}

  ${mediaQuery.xs`
    display: inline;
    overflow: auto;
  `}
`;

export const StyledButton = styled.button`
  font-family: ${Fonts.PRIMARY};
  font-size: 16px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.5;
  letter-spacing: 0.34px;
  color: ${Colors.DARK_SKY_BLUE};
  border: none;
  background-color: unset;
  cursor: pointer;
  padding: 0;
`;
