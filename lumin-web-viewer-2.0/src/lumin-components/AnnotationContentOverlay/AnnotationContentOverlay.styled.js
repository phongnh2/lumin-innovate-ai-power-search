import styled from 'styled-components';

import { typographies } from 'constants/styles/editor';

export const AnnotationContentOverlay = styled.div`
  border-radius: 8px;
  padding: 4px 8px;
  background: ${({ theme }) => theme.le_main_inverse_surface};
  color: ${({ theme }) => theme.le_main_inverse_on_surface};
  display: flex;
  flex-direction: column;
  max-width: 200px;
`;

export const Contents = styled.div`
  ${{ ...typographies.le_body_small }}

  text-overflow: ellipsis;
  overflow: hidden;
  word-break: break-word;

  /* Addition lines for 2 line or multiline ellipsis */
  /* stylelint-disable-next-line value-no-vendor-prefix */
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  white-space: normal;
`;
