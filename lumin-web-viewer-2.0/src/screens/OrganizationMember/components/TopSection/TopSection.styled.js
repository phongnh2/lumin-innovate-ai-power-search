import styled from 'styled-components';
import SharedInput from 'lumin-components/Shared/Input';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  
  ${mediaQuery.md`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  `}
`;

export const Wrapper = styled.div`
  display: flex;
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 0;
  `}

  ${mediaQuery.xl`
    width: 100%;
  `}
`;

export const LeftNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const TitleDesktop = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: ${Colors.NEUTRAL_100};
  margin-right: 12px;
`;

export const TextButton = styled.span`
  margin-left: 8px;
`;

export const TitleMobile = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 20px;
    line-height: 28px;
  `}

  ${mediaQuery.xl`
    display: none;
  `}
`;

export const Edit = styled.div`
  width: 100%;
  display: flex;
`;

export const InputTablet = styled(SharedInput)`
  width: 280px;
`;

export const ButtonSearch = styled(ButtonMaterial)`
  min-width: 44px;
  padding: 0;
  margin-left: 16px;
  display: none;

  ${mediaQuery.md`
    display: block;
  `}

  ${mediaQuery.xl`
    display: none;
  `}  
`;

export const InputWrapper = styled.div`
  width: 44px;
  position: absolute;
  right: 60px;
  z-index: 2;
  visibility: hidden;
  transition: all 0.5s;

  ${({ $isShowInput }) => $isShowInput && `
    width: calc(100% - 60px);
    visibility: visible;
  `}
`;
