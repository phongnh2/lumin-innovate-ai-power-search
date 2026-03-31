import styled from 'styled-components';
import ButtonMaterial from 'luminComponents/ViewerCommon/ButtonMaterial';
import { Colors, Fonts } from 'constants/styles';

export const Container = styled.div`
  width: 290px;
  padding: 6px 8px 6px 16px;
  border-radius: var(--border-radius-primary);
  border: 1px solid transparent;
  align-items: center;
  font-size: 14px;
  background: ${({ theme }) => theme.background};
  margin: -8px 0;
  &.transformed {
    margin: 8px;
    width: auto;
    padding: 7px;
    box-shadow: none;
    border: 1px solid ${({ theme }) => theme.border};
  }
`;

export const Main = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
`;

export const IconSearch = styled.div`
  margin-right: 10px;
  i {
    color: ${Colors.NEUTRAL_40};
  }
`;

export const Input = styled.input`
  font-family: ${Fonts.PRIMARY};
  width: 100%;
  height: 20px;
  border: transparent;
  font-size: 14px;
  outline: none;
  padding: 0;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.textPrimary};

  &::placeholder {
    padding-left: 3px;
    color: ${({ theme }) => theme.textSecondary};
  }
`;

export const ResultsCount = styled.div`
  display: flex;
  white-space: nowrap;
  align-items: center;
  color: ${({ theme }) => theme.textSecondary};
  span {
    margin-right: 4px;
  }
  &.has-value {
    color: ${({ theme }) => theme.textActive};
  }
`;

export const StyledButtonMaterial = styled(ButtonMaterial)`
  && {
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 26px;
    min-height: 24px;
    border-left: 0;
    padding: 0;
    i {
      color: ${({ theme }) => theme.textSecondary};
    }
    &.has-value {
      i {
        color: ${({ theme }) => theme.textActive};
      }
    }
  
    &:first-child {
      margin-right: 2px;
    }
    &.view-more {
      width: 28px;
      min-height: 28px;
      i {
        color: ${({ theme }) => theme.textActive};
      }
    }
    &:hover {
      background: ${({ theme }) => theme.hover};

      &.view-more {
        i {
          color: ${({ theme }) => theme.hoverIcon};
        }
      }
    }
  }
`;

export const Divider = styled.div`
  width: 1px;
  height: 24px;
  margin: 0 4px;
  background-color: ${({ theme }) => theme.border};
  &.transformed {
    margin: 0 4px;
  }
`;

export const OptionsArea = styled.div`
  margin: 10px;
  color: ${({ theme }) => theme.checkboxText};
  span {
    font-family: ${Fonts.PRIMARY};
  }
`;
