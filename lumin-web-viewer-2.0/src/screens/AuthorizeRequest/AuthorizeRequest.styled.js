import styled from 'styled-components';
import { Button } from 'lumin-ui/kiwi-ui';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Fonts, Colors } from 'constants/styles';
import { typographies } from 'lumin-ui/tokens';

export const AuthorizationContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  flex-direction: column;
  max-width: 500px;
  margin: 45px auto auto;
  padding: 0 16px;
  ${mediaQuery.md`
    margin-top: 80px;
  `}
`;
export const ImageContainer = styled.div`
  margin: 0 auto;
`;
export const AuthorizationImage = styled.img`
  width: 204px;
  ${mediaQuery.md`
    width: 320px;
  `}
`;
export const Title = styled.h1`
  ${typographies.kiwi_typography_headline_lg}
  margin-top: 24px;
  text-align: center;
  ${mediaQuery.md`
    margin-top: 48px;
    ${typographies.kiwi_typography_headline_xl}
  `}
`;
export const Message = styled.p`
  ${typographies.kiwi_typography_body_sm}
  text-align: center;
  margin-top: 12px;
  ${mediaQuery.md`
    ${typographies.kiwi_typography_body_md}
  `}
`;
export const ButtonAuthorization = styled(Button)`
  margin-top: 24px;
  min-width: 200px;
`;
