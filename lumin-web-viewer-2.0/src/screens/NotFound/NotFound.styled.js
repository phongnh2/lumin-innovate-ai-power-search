import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Fonts, Colors } from 'constants/styles';

export const NotFoundContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 500px;
  margin: 39px auto auto;
  padding: 0 16px;
  ${mediaQuery.md`
    margin-top: 66px;
  `}
`;
export const ImageContainer = styled.div`
  margin: 0 auto;
`;
export const NotFoundImage = styled.img`
  width: 204px;
  ${mediaQuery.md`
    width: 320px;
  `}
`;
export const Title = styled.h1`
  margin-top: 24px;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  ${mediaQuery.md`
    margin-top: 48px;
    font-size: 24px;
    line-height: 32px;
  `}
`;
export const Message = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  margin-top: 12px;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
export const ButtonDocument = styled(ButtonMaterial)`
  min-width: 200px;
  margin-top: 24px;
`;
