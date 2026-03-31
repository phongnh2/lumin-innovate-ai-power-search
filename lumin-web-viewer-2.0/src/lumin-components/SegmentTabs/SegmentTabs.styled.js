import styled from 'styled-components';
import { Colors, Fonts } from 'constants/styles';

export const Segment = styled.div`
  height: 48px;
  margin: 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${Colors.WHITE};
  border: 1px solid ${Colors.PRIMARY_80};
  border-radius: 29px;
  padding: 2px;
  box-sizing: border-box;
  position: relative;
`;

export const SegmentButton = styled.button`
  width: 145px;
  height: 100%;
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${Colors.NEUTRAL_60};
  background-color: transparent;
  border-radius: 29px;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;
  box-sizing: border-box;
  z-index: 1;
  transition: color 0.3s ease;

  ${({ active }) => active && `
    color: ${Colors.WHITE};
  `}
`;
export const ActiveTab = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 145px;
  height: calc(100% - 4px);
  border-radius: 29px;
  background-color: ${Colors.PRIMARY_70};
  z-index: 0;
  transform: translate3d(${({ $activeIndex }) => `${$activeIndex * 145}px`}, 0, 0);
  transition: transform 0.3s ease;
  will-change: transform;
`;
