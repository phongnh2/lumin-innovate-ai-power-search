import styled from 'styled-components';
import Button from '@mui/material/Button';
import withStyles from '@mui/styles/withStyles';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

const CustomButton = withStyles({
  label: {
    width: '100%',
    height: '100%',
    display: 'block',
  },
})(Button);

export const Container = styled(CustomButton)`
  width: 100%;
  border-radius: 8px;
  height: 64px;
  border: var(--border-primary);
  padding: 0 16px;
  box-sizing: border-box;

  &:hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;

export const Wrapper = styled.div`
  display: grid;
  align-items: center;
  height: 100%;
  grid-template-columns: min-content minmax(0, 1fr) min-content;
  column-gap: 12px;
  min-width: 0;
  text-align: left;
`;

export const Text = styled.p`
  font-size: 12px;
  font-weight: 400;
  color: ${Colors.NEUTRAL_100};
  line-height: 16px;
  text-transform: initial;
  text-align: left;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  width: 100%;

  b {
    font-weight: 600;
    color: ${Colors.NEUTRAL_100};
  }
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const SmallText = styled(Text)`
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
`;

export const PrimaryText = styled.span`
  font-size: 12px;
  font-weight: 400;
  text-transform: initial;
  color: ${Colors.NEUTRAL_80};
  display: inline-block;
  line-height: 16px;
  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const BoldText = styled(PrimaryText)`
  font-weight: 600;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  margin-bottom: 4px;
  color: ${Colors.NEUTRAL_100};
`;

export const LinkText = styled(BoldText)`
  display: inline-block;
  color: ${Colors.SECONDARY_50};
  margin-bottom: 0;
`;

export const Content = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;
