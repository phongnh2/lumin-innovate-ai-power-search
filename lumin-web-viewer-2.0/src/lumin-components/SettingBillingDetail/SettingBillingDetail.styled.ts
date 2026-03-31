import styled from 'styled-components';

import PopperButton from 'lumin-components/PopperButton';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Heading = styled.h6`
  color: ${Colors.NEUTRAL_80};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const Popper = styled(PopperButton)`
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-primary);
  border: var(--border-primary);
  max-width: 440px;
  justify-content: space-between;
  text-transform: none;
  padding: 0 24px 0 16px;
  color: ${Colors.NEUTRAL_100};
  font-weight: 375;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 20px;
`;

export const Text = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  margin-right: 16px;
`;

export const NoWorkspace = styled.div`
  padding: 40px 0;
`;

export const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Image = styled.img`
  width: 312px;
  ${mediaQuery.md`
    width: 440px;
  `}
`;

export const NoWorkspaceText = styled.div`
  color: ${Colors.NEUTRAL_80};
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${mediaQuery.md`
    font-size: 17px;
    line-height: 24px;
    margin-top: 24px;
  `}
`;
