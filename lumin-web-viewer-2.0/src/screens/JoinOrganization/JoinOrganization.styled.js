import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { mediaQuery } from 'utils/styles/mediaQuery';
import { Colors } from 'constants/styles';

export const Container = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
  display: flex;
  justify-content: center;
  padding: 24px 16px;
  background-color: ${Colors.NEUTRAL_10};
`;

export const Paper = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  border-radius: var(--border-radius-primary);

  ${mediaQuery.md`
    margin-top: 24px;
  `}

  ${mediaQuery.xl`
    margin-top: 32px;
  `}
`;

export const Title = styled.h1`
  font-weight: 600;
  font-size: 24px;
  line-height: 32px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.md`
    font-size: 29px;
    line-height: 36px;
  `}
`;

export const Description = styled.h1`
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-top: 12px;

  b {
    font-weight: 600;
  }
`;

export const List = styled.div`
  width: 100%;
  max-height: 454px;
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 8px;
  margin-top: 16px;
  overflow-y: auto;

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const Button = styled(ButtonMaterial)`
  margin-top: 16px;
  background-color: ${Colors.WHITE};

  ${mediaQuery.md`
    margin-top: 24px;
  `}
`;

export const TextButton = styled.span`
  margin-left: 12px;
`;
