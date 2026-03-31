import styled, { css } from 'styled-components';
import SharedPopperButton from 'lumin-components/PopperButton';
import { Colors, Fonts } from 'constants/styles';

export const PopperButton = styled(SharedPopperButton)`
  min-width: 44px;
  margin-left: 16px;
`;

export const List = styled.div``;

export const Item = styled.div`
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 8px 24px;
  box-sizing: border-box;
  cursor: pointer;
  ${(props) =>
    props.disabled &&
    css`
      pointer-events: none;
      opacity: 0.5;
    `};

  :hover {
    background-color: ${Colors.NEUTRAL_10};
  }
`;

export const Text = styled.span`
  font-family: ${Fonts.PRIMARY};
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 20px;
  color: ${Colors.NEUTRAL_100};
  margin-left: 12px;

  ${({ $danger }) => $danger && `
    color: ${Colors.SECONDARY_50};
  `}
`;

export const Divider = styled.div`
  width: calc(100% - 32px);
  height: 1px;
  background-color: ${Colors.NEUTRAL_20};
  margin: 8px auto;
`;
