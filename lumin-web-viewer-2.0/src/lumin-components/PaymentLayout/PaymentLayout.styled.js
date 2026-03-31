import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors, Fonts } from 'constants/styles';

export const Wrapper = styled.section`
  width: 100%;
  /* min-height: 100vh; */
  background-color: ${Colors.NEUTRAL_10};
`;

export const WrapperReskin = styled.section`
  width: 100%;
  background-color: var(--color-le-main-background);
`;

export const Header = styled.div`
  height: 72px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  background-color: ${Colors.WHITE};
  position: sticky;
  top: 0;
  z-index: calc(var(--zindex-popover) + 1);
`;

export const HeaderReskin = styled.div`
  height: 72px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  position: sticky;
  background-color: var(--color-le-main-background);
  top: 0;
  z-index: calc(var(--zindex-popover) + 1);
`;

export const Container = styled.div`
  padding: 8px 16px 32px;
  min-height: calc(100vh - 72px);
  ${mediaQuery.md`
    padding: 8px 0 32px;
    max-width: 632px;
    width: 100%;
    margin: 0 auto;
  `}
  ${mediaQuery.xl`
    padding-top: 16px;
    padding-bottom: 56px;
    max-width: none;
  `}
`;

export const BackButton = styled(ButtonMaterial)`
  padding: 6px 12px;
`;

export const BackButtonReskin = styled(ButtonMaterial)`
  padding: 6px 12px;
  
  span{
    color: ${Colors.LUMIN_SIGN_PRIMARY};
    font-family: ${Fonts.SECONDARY};
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
  }
`;
