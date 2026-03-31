import { spacings, typographies } from 'constants/styles/editor';
import styled from 'styled-components';

export const ModalTitle = styled.div`
  color: ${({ theme }) => theme.le_main_on_surface};
  margin-bottom: ${spacings.le_gap_2}px;
  ${{ ...typographies.le_title_large }}
`;

export const ContentWrapper = styled.div`
  margin-top: ${spacings.le_gap_1}px;
`;

export const ModalContentWrapper = styled.div`
`;

export const SignaturePad = styled.div`
  background-color: ${({ theme }) => theme.le_signature_signature_container};
  border-radius: 8px;
  overflow: hidden;
`;