import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const RequestAccessContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: 48px auto auto;
  padding: 0 16px;
`;
export const ImageRequestAccess = styled.img`
  width: 240px;
  ${mediaQuery.md`
    width: 420px;
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
    font-size: 24px;
    line-height: 32px;
  `}
  ${mediaQuery.xl`
    margin-top: 32px;
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
  & > b {
    font-weight: 600;
  }
`;
export const ButtonContainer = styled.div`
  margin-top: 24px;
  width: 100%;
  display: flex;
  flex-direction: column;
  ${mediaQuery.md`
    justify-content: center;
    flex-direction: row;
  `}
`;
export const RequestAccessButton = styled(ButtonMaterial)`
  width: 100%;
  margin-bottom : 12px;
  ${mediaQuery.md`
    width: 200px;
    margin-right: 16px;
  `}
`;
