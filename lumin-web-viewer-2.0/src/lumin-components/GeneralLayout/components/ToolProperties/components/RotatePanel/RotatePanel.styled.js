import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const BaseInputContainer = styled.div`
  display: flex;
  gap: ${spacings.le_gap_1}px;
`;

export const RotateByPagesInputContainer = styled(BaseInputContainer)`
  .text-field-wrapper {
    flex-grow: 1;
  }

  > :not(.text-field-wrapper) {
    margin-bottom: auto;
  }
`;

export const RotateByRangeInputContainer = styled(BaseInputContainer)`
  align-items: flex-end;

  .text-field-wrapper {
    flex: 1;
  }
`;

export const Error = styled.div(({ theme }) => ({
    ...typographies.le_body_small,
    color: theme.le_error_error,
    marginTop: 8,
  }));

export const Wrapper = styled.div`
  padding: var(--kiwi-spacing-1) var(--kiwi-spacing-2);
`;

export const BaseSection = styled.div`
  margin-bottom: ${spacings.le_gap_1}px;
`;

export const Desc = styled(BaseSection)`
  ${{ ...typographies.le_body_small }}
  ${({ theme }) => `
    color: ${theme.le_main_on_surface_variant};
    span {
        color: ${theme.le_main_on_surface};
    }
`}
`;

export const Title = styled(BaseSection)`
  ${{ ...typographies.le_title_small }}
  ${({ theme }) => `
    color: ${theme.le_main_on_surface};
`}
`;

export const MainContent = styled.div`
  background-color: ${({ theme }) => theme.le_main_surface_container_low};
  margin: 0px ${spacings.le_gap_1 * -1}px;
  padding: ${spacings.le_gap_1}px;
  border-radius: 8px;
`;

export const DividerWrapper = styled.div`
  margin-bottom: ${spacings.le_gap_2}px;
`;

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.le_gap_0_25}px;
`;
export const Label = styled.span`
  ${{ ...typographies.le_label_medium }}
  color: ${({ theme }) => theme.le_main_on_surface_variant};
`;
