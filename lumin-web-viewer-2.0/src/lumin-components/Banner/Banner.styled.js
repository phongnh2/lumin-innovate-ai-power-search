import styled from 'styled-components';
import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const BannerContainer = styled.div`
  background-color: ${Colors.WHITE};
  border-radius: 8px;
  width: 208px;
  box-sizing: border-box;
  border: 1px solid ${Colors.PRIMARY_50};
  padding: 16px;
  margin: 16px 0 16px 16px;
  ${mediaQuery.xl`
    width: 240px;
  `}
`;
export const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
export const CloseButton = styled.button`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: ${Colors.WHITE};
  outline: none;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;
export const BannerImage = styled.img``;
export const DescriptionContainer = styled.div``;
export const Title = styled.div`
  margin-top: 12px ;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};
`;
export const Description = styled.div`
  margin-top: ${({ hasTitle }) => (hasTitle ? '8px' : '12px')};
  font-family: ${Fonts.PRIMARY};
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  text-align: center;
  color: ${Colors.NEUTRAL_80};

`;
export const ButtonLink = styled(ButtonMaterial)`
  margin-top: 16px;
`;
