import styled from 'styled-components';

import { spacings, typographies } from 'constants/styles/editor';

export const Wrapper = styled.div`
  gap: ${spacings.le_gap_1}px;
  margin-bottom: ${spacings.le_gap_1}px;
  display: flex;
  flex-direction: column;
  &[data-no-gap='true'] {
    margin-bottom: 0;
  }
`;

export const IconWrapper = styled.div`
  padding: 4px;
`;

export const RequestSignatureBtn = styled.div`
  padding: ${spacings.le_gap_1}px ${spacings.le_gap_0_5}px;
  display: flex;
  gap: ${spacings.le_gap_0_5}px;
  align-items: center;
  background-color: ${({ theme }) => theme.le_main_tertiary_container};
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0);
  transition: all 0.2s ease-in-out;
  color: ${({ theme }) => theme.le_main_on_tertiary_container};

  &:hover {
    background: ${({ theme }) =>
      `linear-gradient(${theme.le_state_layer_tertiary_container_hovered}, ${theme.le_state_layer_tertiary_container_hovered}, ${theme.le_main_tertiary_container})`};
    background-color: ${({ theme }) => theme.le_main_tertiary_container};
  }
  ${({ $disabled }) =>
    $disabled &&
    `cursor: not-allowed;
    opacity: var(--kiwi-opacity-disabled-on-container);
  `}
`;

export const Title = styled.div`
  ${{ ...typographies.le_title_small }}
`;

export const Desc = styled.div`
  ${{ ...typographies.le_body_small }}
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`;

export const RequestSignatureTitle = styled.div`
${{ ...typographies.le_title_small }}
  color: ${({ theme }) => theme.le_main_on_surface};
`;