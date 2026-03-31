import styled from 'styled-components';

import ButtonMaterial from 'lumin-components/ButtonMaterial';

import { Colors, Fonts } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';

export const Title = styled.h2`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  text-align: center;
  margin-bottom: 16px;

  ${mediaQuery.sm`
    font-size: 17px;
    line-height: 24px;
  `}
`;

export const RowContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
`;

export const RowWrapper = styled.div`
  ${RowContainer} {
    &:not(:last-child) {
      margin-bottom: 12px;

      ${mediaQuery.sm`
        margin-bottom: 16px;
      `}
    }
  }
`;

export const RowItem = styled.div``;

export const Divider = styled.div`
  width: 100%;
  margin: 12px 0;
  border-top: var(--border-secondary);

  ${mediaQuery.sm`
    margin: 16px 0;
  `}
`;

export const FieldTitle = styled.p`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: 600;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_100};

  ${mediaQuery.sm`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const FieldDesc = styled.div`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};
  overflow-wrap: break-word;

  ${mediaQuery.sm`
    font-size: 14px;
    line-height: 20px;
  `}
`;

export const Location = styled.div`
  display: flex;

  i {
    margin-right: 8px;
  }
`;
export const LocationReskin = styled.div`
  display: flex;
  gap: var(--kiwi-spacing-1-25);
  align-items: start;

  & > div:last-child {
    min-width: 0;
  }
`;

export const Button = styled(ButtonMaterial)`
  margin-top: 16px;

  ${mediaQuery.sm`
    margin-top: 24px;
  `}
`;
