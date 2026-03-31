import styled from 'styled-components';

import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const StyledWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  padding: 0 24px;
  margin-top: 32px;

  ${mediaQuery.md`
    margin-top: 76px;
    padding: 0;
  `}
`;

export const StyledImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
`;
export const StyledImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 70.1%;
  `;
export const StyledImageWrapper = styled.div`
  margin: 0 auto;
  width: 100%;
  max-width: 428px;
`;

export const StyledTitle = styled.h1`
  font-size: 17px;
  line-height: 24px;
  font-weight: 600;
  margin-top: 24px;
  color: ${Colors.NEUTRAL_100};
  
  ${mediaQuery.md`
    margin-top: 32px;
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const StyledMessage = styled.span`
  font-size: 14px;
  line-height: 20px;
  font-weight: 375;
  margin-top: 12px;
  color: ${Colors.NEUTRAL_80};
  text-align: center;

  b {
    font-weight: 600;
  }

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const StyledButton = styled(ButtonMaterial)`
  margin-top: 24px;
  width: 200px;
`;
