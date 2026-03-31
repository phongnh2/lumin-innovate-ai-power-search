import styled from 'styled-components';
import ReactSlider from 'react-slider';
import { Colors, Shadows } from 'constants/styles';

export const SLIDER_HEIGHT = 24;

export const StyledSlider = styled(ReactSlider)`
  width: 100%;
  height: ${SLIDER_HEIGHT}px;
  ${(props) => props.customCss};

  .track {
    top: 50%;
    transform: translateY(-50%);
    background: ${({ trackColor }) => trackColor || Colors.NEUTRAL_100};
    height: 6px;
    border-radius: ${SLIDER_HEIGHT}px;
    opacity: ${(props) => (props.disabled ? '0.7' : '1')};
  }
  .track-1 {
    top: 50%;
    transform: translateY(-50%);
    background: ${Colors.SMOKE};
    height: 6px;
    border-radius: ${SLIDER_HEIGHT}px;
    opacity: ${(props) => (props.disabled ? '0.7' : '1')};
  }
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};
  pointer-events: ${(props) => (props.disabled && 'none')};
`;
export const StyledButton = styled.div`
  width: ${SLIDER_HEIGHT}px;
  height: ${SLIDER_HEIGHT}px;
  background: white;
  border-radius: ${SLIDER_HEIGHT}px;
  border: 2px solid ${Colors.GRAY7};
  cursor: pointer;
  box-shadow: ${Shadows.BUTTON_SHADOW};
  outline: none;
  &:after {
    content: '';
    display: block;
    width: 18px;
    height: 18px;
    border-radius: ${SLIDER_HEIGHT}px;
    background: ${Colors.NEUTRAL_100};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const StyledCustomThumbImage = styled.div`
  width: 20px;
  cursor: pointer;
  outline: none;
  height: 24px;
  &:after {
    content: '';
    display: block;
    width: ${({ sizeThumbImage }) => (sizeThumbImage ? `${sizeThumbImage}px` : '20px')};
    height: ${({ sizeThumbImage }) => (sizeThumbImage ? `${sizeThumbImage}px` : '24px')};
    position: absolute;
    top: 50%;
    left: 50%;
    ${(props) => props.image && `background: url("${props.image}") no-repeat;`}
    opacity: 1;
    transform: translate(-50%, -50%);
  }
`;

export const SlideToolTipText = styled.span`
  width: 96px;
  white-space: wrap;
  background-color: ${Colors.primary};
  color: white;
  text-align: center;
  padding: 4px 0;
  border-radius: 4px;
  position: absolute;
  z-index: 3;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  transition: all 0.3s ease;
  visibility: visible;
  opacity: 1;

  ${({ customCssTooltip }) => customCssTooltip}

  &:before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    background-color: ${Colors.WHITE};
  }
`;
