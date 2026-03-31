import styled from 'styled-components';
import { rgba } from 'polished';
import { Colors } from 'constants/styles';
import { styledPropConfigs } from 'utils/styled';

export const Container = styled.div.withConfig(styledPropConfigs(['loading']))`
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transition: opacity 0.3s ease;
    opacity: 0;
    transform: ${({ loading }) => (loading ? 'translate3d(0, 0, 0)' : 'translate3d(0, -100%, 0)')};
    opacity: ${({ loading }) => (loading ? 1 : 0)};
    background-color: ${rgba(Colors.WHITE, 0.6)};
    z-index: 1;
  }
`;

export const HeaderTitle = styled.h5`
  font-size: 20px;
  line-height: 28px;
  font-weight: 600;
  text-align: left;
  width: 100%;
  margin-bottom: 12px;
  color: ${Colors.NEUTRAL_100};
`;
export const HeaderText = styled.p`
  font-weight: 400;
  color: ${Colors.NEUTRAL_80};
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
`;
export const HeaderBold = styled.span`
  color: ${Colors.NEUTRAL_100};
  font-weight: 600;
`;
export const Divider = styled.div`
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  margin: 16px 24px;
`;
export const ErrorBlock = styled.div`
  padding: 12px 16px;
  background-color: ${Colors.SECONDARY_10};
  color: ${Colors.SECONDARY_50};
  font-size: 14px;
  font-weight: 600;
  width: 100%;
  box-sizing: border-box;
  border-radius: 8px;
  max-height: 44px;
`;
export const HeaderContainer = styled.div`
  margin: 24px 24px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  > * {
    &:last-child {
      margin-bottom: 0;
    }
  }
`;
