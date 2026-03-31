import RadioGroup from '@mui/material/RadioGroup';
import { withStyles, makeStyles } from '@mui/styles';
import { Button as KiwiButton } from 'lumin-ui/kiwi-ui';
import styled, { css } from 'styled-components';

import Paper from 'lumin-components/GeneralLayout/general-components/Paper';

import { spacings, typographies } from 'constants/styles/editor';

const BaseWrapper = css`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_2}px;
`;

export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${spacings.le_gap_2}px;
`;

export const PaperWrapper = styled(Paper)`
  padding: ${spacings.le_gap_2}px;
  ${BaseWrapper};
`;

export const ContentWrapper = styled.div`
  padding: 0 ${spacings.le_gap_1}px;
  ${BaseWrapper};
`;

export const TitleWrapper = styled.div`
  ${BaseWrapper};
  padding: 0;
  gap: ${spacings.le_gap_0_5}px;
  margin-bottom: ${spacings.le_gap_0_5}px;
`;

export const Title = styled.span`
  ${{ ...typographies.le_title_large }}
  ${({ theme }) =>
    `
      color: ${theme.le_main_on_surface};
    `}
`;

export const SubTitle = styled.span`
  ${{ ...typographies.le_body_medium }}
  ${({ theme }) =>
    `
      color: ${theme.le_main_on_surface_variant};
    `}
`;

export const CustomLabel = styled.label`
  ${{ ...typographies.le_title_small }}
  margin-left: ${spacings.le_gap_1}px !important;
  ${({ theme }) =>
    `
      color: ${theme.le_main_on_surface};
    `}
`;

export const useFormControlLabelStyle = makeStyles({
  root: {
    margin: '0 !important',
  },
  label: ({ theme }) => ({
    ...typographies.le_title_small,
    color: theme.le_main_on_surface,
    marginLeft: `${spacings.le_gap_1}px !important`,
    '&.Mui-disabled': {
      color: `${theme.le_disable_on_container} !important`,
    },
  }),
});

export const CustomRadioGroup = withStyles({
  root: {
    gap: `${spacings.le_gap_1}px !important`,
  },
})(RadioGroup);

export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
`;

export const FormFieldLabel = styled.span`
  ${{ ...typographies.le_label_large }}
  ${({ theme }) =>
    `
      color: ${theme.le_main_on_surface_variant};
    `}
  display: flex;
  align-items: center;
`;

export const Container = styled.div`
  width: 100%;
  ${BaseWrapper};
`;

export const Label = styled.span`
  ${({ theme }) =>
    `
    color: ${theme.le_main_on_surface_variant};
  `}
  ${{ ...typographies.le_body_medium }}
`;

export const Bold = styled.b`
  font-weight: 600;
  ${({ theme }) =>
    `
    color: ${theme.le_main_on_surface};
  `}
`;

export const LocationHolder = styled.div`
  width: 100%;
  display: flex;
  justify-content: start;
  ${({ theme }) =>
    `
    color: ${theme.le_main_on_surface_variant};
  `}
`;

export const LocationField = styled.div`
  display: flex;
  justify-content: start;
  align-items: center;
  flex-grow: 1;
  padding-right: 16px;
  max-width: 70%;
  ${({ theme }) =>
    `
    border-right: 1px solid ${theme.le_main_outline_variant};
  `}
`;

export const LocationContent = styled.span`
  text-align: left;
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  ${{ ...typographies.le_body_small }}
`;

export const ChangeInput = styled(KiwiButton)`
  margin-left: 8px;
`;
