import IconButton from '@new-ui/general-components/IconButton';
import { typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const Container = styled.div`
  &[data-new-layout='true'] {
    margin-bottom: 16px;
  }
`;

export const ContentWrapper = styled.div`
  &[data-new-layout='true'] {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
  }
`;

export const Label = styled.label`
  &[data-new-layout='true'] {
    margin-bottom: 4px;
    color: ${({ theme }) => theme.le_main_on_surface};
    ${typographies.le_title_small};
    display: inline-block;
  }
`;

export const ButtonsContainer = styled.div`
  &[data-new-layout='true'] {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
`;

export const ColorPickerIcon = styled.span`
  display: block;
  width: 24px;
  height: 24px;
  border: 1px solid ${({ theme }) => theme.le_main_outline};
  border-radius: 99px;
  flex-shrink: 0;
  box-sizing: border-box;
`;

export const Divider = styled.hr`
  border: none;
  width: 1px;
  height: 16px;
  margin: 0;
  background-color: ${({ theme }) => theme.le_main_outline_variant};
`;
