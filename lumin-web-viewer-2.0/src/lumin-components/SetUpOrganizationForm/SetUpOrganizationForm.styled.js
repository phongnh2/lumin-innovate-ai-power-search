import styled from 'styled-components';
import { Link as LinkRouter } from 'react-router-dom';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Container = styled.div``;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 17px;
  line-height: 24px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const InputWrapper = styled.div`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 12px;

  ${mediaQuery.md`
    margin-top: 16px;
  `}
`;

export const TextSwitch = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  margin-left: 8px;

  ${mediaQuery.md`
    font-size: 14px;
    line-height: 20px;
  `}

  b {
    font-weight: 600;
  }
`;

export const TypeWrapper = styled.div`
  margin-top: 16px;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const TypeLabel = styled.p`
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};
`;

export const TypeContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${mediaQuery.md`
    flex-direction: row;
  `}
`;

export const TypeGroup = styled.div`
  display: flex;
  margin-top: 8px;
`;

export const TypeItem = styled.div`
  max-height: 40px;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${({ $active }) => ($active ? Colors.WHITE : Colors.PRIMARY_90)};
  padding: 10px 12px;
  background-color: ${({ $active }) => ($active ? Colors.PRIMARY_90 : Colors.WHITE)};
  border-radius: var(--border-radius-primary);
  cursor: pointer;

  &:not(:first-child) {
    margin-left: 8px;
  }

  ${({ $disabled }) => $disabled && `
    pointer-events: none;
  `}
`;

export const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: var(--border-secondary);

  ${mediaQuery.md`
    flex-direction: row;
    padding-top: 24px;
  `}
`;

export const Button = styled(ButtonMaterial)`
  width: 100%;

  ${mediaQuery.md`
    width: ${({ $hasLinkJoinOrg }) => ($hasLinkJoinOrg ? '50%' : '100%')};
  `}
`;

export const Link = styled(LinkRouter)`
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_70};
  margin-top: 16px;
  ${({ $loading }) => $loading && `
    pointer-events: none;
  `}

  &:hover {
    text-decoration-line: underline;
  }

  ${mediaQuery.md`
    width: 50%;
    margin-top: 0;
    margin-left: 24px;
  `}
`;
