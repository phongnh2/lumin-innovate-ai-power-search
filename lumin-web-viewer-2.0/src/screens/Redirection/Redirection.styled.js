import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Colors, Shadows, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  min-height: 100vh;
  padding: 32px 16px 0;
  overflow-y: hidden;
`;
export const LogoLink = styled(Link)`
  width: 128px;
  display: block;
  ${mediaQuery.md`
    width: 168px;
  `}
`;
export const Wrapper = styled.div`
  padding: 24px 36px;
  background-color: ${Colors.WHITE};
  box-shadow: ${Shadows.SHADOW_M};
  border-radius: 8px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  ${mediaQuery.md`
    margin: 128px auto 0;
    width: 640px;
  `}
`;
export const ImgContainer = styled.div`
  margin-bottom: 24px;
  max-width: 250px;
  width: 100%;
`;
export const ImgWrapper = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%;
`;
export const Title = styled.h1`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  text-align: center;
  color: ${Colors.NEUTRAL_100};
  margin-bottom: 4px;
  ${mediaQuery.md`
    margin-bottom: 16px;
    font-size: 28px;
    line-height: 32px;
  `}
`;
export const Description = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}
`;
