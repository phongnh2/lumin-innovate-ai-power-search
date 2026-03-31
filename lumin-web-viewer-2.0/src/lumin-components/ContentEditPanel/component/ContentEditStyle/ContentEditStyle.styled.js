import styled, { css } from 'styled-components';
import ActionButton from 'luminComponents/ActionButton';
import MaterialSelect from 'lumin-components/MaterialSelect';
import Input from 'lumin-components/Shared/Input';

export const StyledWrapper = styled.div`
  display: block;
  margin: 16px 0;

  ${(props) =>
    props.$disabled &&
    css`
      &:hover {
        cursor: not-allowed;
      }
      & > * {
        user-select: none;
        pointer-events: none;
        opacity: 0.5;
      }
    `}
`;

export const StyledPaletteWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin: 16px 0;
`;

export const StyledTextWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  ${(props) =>
    props.$disabled &&
    css`
      &:hover {
        cursor: not-allowed;
      }
      & > * {
        user-select: none;
        pointer-events: none;
        opacity: 0.5;
      }
    `}
`;

export const StyledActionButton = styled(ActionButton)`
  min-width: 92px !important;
  height: 28px;
  border: 1px solid ${({ theme }) => theme.divider};
  border-radius: 4px !important;
  justify-content: center;
  display: flex;
  background: ${({ theme }) => theme.background};
`;

export const StyledMaterialSelect = styled(MaterialSelect)`
  min-width: 200px;
  height: 28px !important;
  padding: 0;
  border-radius: 4px !important;
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.divider};
  padding-left: 2px !important;
  padding-right: 7px !important;

  & span {
    width: 170px;
    text-align: center;
  }

  & i {
    color: ${({ theme }) => theme.icon};
  }
`;

export const StyledInput = styled(Input)`
  min-width: 80px;
  height: 28px;

  & i {
    color: ${({ theme }) => theme.icon};
  }
`;
