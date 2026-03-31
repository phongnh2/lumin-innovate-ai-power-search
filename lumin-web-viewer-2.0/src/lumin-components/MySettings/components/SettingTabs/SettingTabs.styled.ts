import styled from 'styled-components';
import SharedTabs from 'lumin-components/Shared/Tabs';
import { Colors } from 'constants/styles';

export const Tabs = styled(SharedTabs)`
  position: relative;
  display: inline-flex;
  overflow: visible;
  &:before {
    content: '';
    position: absolute;
    display: block;
    bottom: 0;
    left: -999px;
    right: -999px;
    height: 1px;
    background-color: ${Colors.NEUTRAL_20};
    z-index: 2;
  }
`;

export const RedBadge = styled.div`
  border-radius: 50%;
  background-color: ${Colors.SECONDARY_50};
  width: 22px;
  height: 22px;
  line-height: 22px;
  color: ${Colors.WHITE};
  font-size: 12px;
  font-weight: 600;
  margin-left: 10px;
`;

export const TabContainer = styled.div`
  padding-top: 24px;
`;