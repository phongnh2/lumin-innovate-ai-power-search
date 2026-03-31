import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery, mediaQueryDown } from 'utils/styles/mediaQuery';

export const Container = styled.div`
  background-color: ${Colors.PRIMARY_10};
  border-radius: var(--border-radius-primary);
  padding: 12px 16px;

  ${({ $isExpand }) => $isExpand && `
    padding-bottom: 16px;
  `}
`;

export const Header = styled.div`
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const Label = styled.div`
  display: flex;
  align-items: center;
`;

export const Text = styled.p`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_90};
  margin-left: 12px;
`;

export const LabelOptional = styled.span`
  color: ${Colors.NEUTRAL_60};
`;

export const Wrapper = styled.div`
  margin-top: ${({ $isEnablePromotionInput }) => ($isEnablePromotionInput ? 14 : 10)}px;

  ${mediaQuery.md`
    margin-top: ${({ $isEnablePromotionInput }) => ($isEnablePromotionInput ? 18 : 10)}px;
  `}
`;

export const InputSection = styled.div`
  width: 100%;
  display: flex;

  ${mediaQueryDown.md`
    flex-direction: column;
  `}
`;

export const InputBox = styled.div`
  flex-grow: 1;
`;

export const ApplyButton = styled.div`
  margin-top: 16px;
  ${mediaQuery.md`
    margin: 0 0 0 16px;
    min-width: 160px;
  `}
`;

export const TickerSection = styled.div`
  display: flex;
  align-items: center;
  margin-top: 8px;
`;

export const Ticket = styled.div`
  display: inline-flex;
  align-items: center;
  height: 44px;
  box-sizing: border-box;
  border-radius: 4px;
  padding: 0 16px;
  margin-right: 8px;
  border: solid 1px ${Colors.PRIMARY_70};
  border-style: dashed;
  background-color: ${Colors.WHITE};
  position: relative;

  &::before,&::after {
    content: '';
    width: 18px;
    height: 18px;
    position: absolute;
    top: 50%;
    background-color: ${Colors.PRIMARY_10};
    border-radius: 50%;
    border: solid 1px ${Colors.PRIMARY_70};
    border-style: dashed;
    z-index: 1;
    box-sizing: border-box;
  }
  &:before {
    left: 0;
    transform: translate3d(-9px, -50%, 0) rotate(-45deg);
    border-top-color: transparent;
    border-left-color: transparent;
  }
  &:after {
    right: 0;
    transform: translate3d(9px,-50%,0) rotate(-45deg);
    border-bottom-color: transparent;
    border-right-color: transparent;
  }
`;

export const TextTicket = styled.span`
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};

  ${(props) => props.couponValue && `
    color: ${Colors.SECONDARY_50};
  `}
`;
