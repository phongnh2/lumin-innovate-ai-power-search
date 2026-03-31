import { Colors } from 'constants/styles';
import styled from 'styled-components';

const getClass = (props) => props.className;
const TRANSITION_DURATION = 0.3;

export const Container = styled.div`
  position: relative;
  padding: 0 24px;
  margin-bottom: 24px;
  ${({ canTransition }) => canTransition && `
    transition: height ${TRANSITION_DURATION}s ease;
    will-change: height;
  `}
`;
export const TeamListSlide = styled.div`
  width: 100%;
  top: 0;
  left: 0;
  will-change: transform;
  &.${getClass}-enter {
    transform: translateX(-110%);
  }
  &.${getClass}-enter-active {
    transform: translateX(0%);
    transition: all ${TRANSITION_DURATION}s ease;
  }
  &.${getClass}-exit {
    position: absolute;
  }
  &.${getClass}-exit-active {
    transform: translateX(-110%);
    transition: all ${TRANSITION_DURATION}s ease;
  }
`;
export const TeamMemberSlide = styled(TeamListSlide)`
  &.${getClass}-enter {
    transform: translateX(110%);
  }
  &.${getClass}-enter-active {
    transform: translateX(0%);
    transition: all ${TRANSITION_DURATION}s ease;
  }
  &.${getClass}-exit {
    position: absolute;
  }
  &.${getClass}-exit-active {
    transform: translateX(110%);
    transition: all ${TRANSITION_DURATION}s ease;
  }
`;
export const VerticalThumb = styled.div`
  border-radius: 4px;
  background-color: ${Colors.GRAY_2};
  width: 6px;
  transition: background-color 0.3s ease-in-out;
  cursor: pointer;
  &:hover {
    background-color: ${Colors.SECONDARY};
  }
`;
