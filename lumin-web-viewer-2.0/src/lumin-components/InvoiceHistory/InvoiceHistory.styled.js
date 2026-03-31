import styled from 'styled-components';
import { Colors } from 'constants/styles';
import { mediaQuery } from 'utils/styles/mediaQuery';
import ButtonMaterial from 'luminComponents/ButtonMaterial';

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr min-content;
  grid-template-rows: repeat(2, min-content);
  gap: 8px 16px;
  grid-auto-flow: column dense;
  align-items: center;

  ${mediaQuery.md`
    grid-template-columns: 6fr 4fr 2fr 3fr;
    grid-template-rows: min-content;
  `}
`;

export const BillingRow = styled(Row)`
  padding: 12px 0;
  border-bottom: 1px solid ${Colors.NEUTRAL_20};
  font-size: 12px;
  line-height: 16px;
  color: ${Colors.NEUTRAL_80};

  &:first-of-type {
    padding-top: 0;
  }

  & > *:nth-child(n + 3) {
    text-align: right;
  }

  ${mediaQuery.md`
    padding: 16px 0;
    font-size: 14px;
    line-height: 20px;

    &:first-of-type {
      padding-top: 16px;
    }

    & > *:nth-child(n + 3) {
      text-align: left;
    }
  `}
`;

export const Header = styled(Row)`
  display: none;
  text-transform: uppercase;
  color: ${Colors.NEUTRAL_80};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;

  ${mediaQuery.md`
    display: grid;
    margin-bottom: 16px;
  `}
`;

export const Id = styled.span`
  font-weight: 600;
  color: ${Colors.NEUTRAL_100};
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

export const Button = styled(ButtonMaterial)`
  display: inline-flex;
  align-items: center;
  padding: 0;
  height: 20px;
  cursor: pointer;

  i {
    margin-right: 12px;
  }
`;
