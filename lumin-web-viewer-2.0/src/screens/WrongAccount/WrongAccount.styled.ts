import { Colors, Shadows } from 'constants/styles';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import SvgElement from 'luminComponents/SvgElement';
import styled from 'styled-components';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Wrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 24px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Frame = styled.div`
  border-radius: var(--border-radius-primary);
  background-color: ${Colors.NEUTRAL_0};
  box-shadow: ${Shadows.SHADOW_M};
  padding: 16px;
  text-align: center;

  ${mediaQuery.md`
    max-width: 640px;
    padding: 24px;
  `}
`;

export const Title = styled.h2`
  color: ${Colors.SECONDARY_50};
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  margin: 0;

  ${mediaQuery.md`
    font-size: 24px;
    line-height: 32px;
  `}
`;

export const Svg = styled(SvgElement)`
  margin-top: 24px;

  ${mediaQuery.md`
    margin-top: 48px;
    padding: 0 24px;
  `}
`;

export const Text = styled.p`
  margin-top: 24px;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_80};

  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
  `}

  b {
    font-weight: 600;
  }
`;

export const Button = styled(ButtonMaterial)`
  width: 200px;
  margin-top: 16px;
`;
