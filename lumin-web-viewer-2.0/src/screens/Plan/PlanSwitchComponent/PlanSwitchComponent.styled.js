import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

import RedArrowMobile from 'assets/lumin-svgs/arrow-pricing-mobile.svg';
import RedArrowDesktop from 'assets/lumin-svgs/arrow-pricing-desktop.svg';

const togglePromote = ({ hidePromote }) => (hidePromote ? 'none' : 'block');

export const Container = styled.div`
  margin: 18px auto 44px;
  display: flex;
  justify-content: center;
  ${mediaQuery.md`
    margin: 26px auto 55px;
  `}
`;

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  &:before {
    content: '';
    width: 24px;
    height: 34px;
    background-image: url('${RedArrowMobile}');
    position: absolute;
    right: -18px;
    bottom: -24px;
    display: ${togglePromote};

    ${mediaQuery.sm`
      width: 40px;
      height: 20px;
      bottom: -22px;
      right: -24px;
      background-image: url("${RedArrowDesktop}");
    `}
  }

  &:after {
    display: ${togglePromote};
    content: '(Save 34%)';
    font-family: ${Fonts.PRIMARY};
    font-style: normal;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: ${Colors.SECONDARY_50};
    position: absolute;
    right: 8px;
    bottom: -26px;

    ${mediaQuery.sm`
      right: -88px;
      bottom: 0;
    `}
  }
`;

export const ItemWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  &:first-child {
    margin-right: 24px;
  }
`;

export const Group = styled.label`
  display: flex;
  align-items: center;
`;

export const Text = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  padding-left: 10px;
  cursor: pointer;
  color: ${Colors.NEUTRAL_70};
  
  ${({ checked }) => checked && `
    color: ${Colors.NEUTRAL_100};
  `}
`;

export const ImageWrapper = styled.div`
  width: 20px;
  height: 20px;
`;

export const Image = styled.img`
  width: 100%;
  height: 100%;
`;

export const Input = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`;
