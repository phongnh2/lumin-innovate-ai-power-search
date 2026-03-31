import React from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import { typographies } from 'constants/styles/editor';

const NewLayoutList = styled.ul`
  ${{ ...typographies.le_body_medium }}
  text-align: left;
  margin-left: 12px;
  & li::marker {
    content: '• ';
  }
`;

const WarningOCRContent = (): JSX.Element => (
    <NewLayoutList>
      <Trans i18nKey="viewer.ocr.modalMessage" components={{ li: <li /> }} />
    </NewLayoutList>
  );

export default WarningOCRContent;