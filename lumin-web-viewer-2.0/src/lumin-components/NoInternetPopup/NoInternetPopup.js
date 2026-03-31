import React from 'react';

import Icomoon from 'lumin-components/Icomoon';

import { useNoConnectionState, useTabletMatch, useTranslation } from 'hooks';
import { useViewerMatch } from 'hooks/useViewerMatch';

import * as Styled from './NoInternetPopup.styled';

function NoInternetPopup() {
  const { isViewer } = useViewerMatch();
  const { showPopup } = useNoConnectionState();
  const isTabletMatched = useTabletMatch();
  const { t } = useTranslation();

  if (isViewer || !isTabletMatched) {
    return null;
  }

  return (
    <Styled.Container $open={showPopup}>
      <Icomoon className="no-internet" size={18} color="#fff" />
      <span style={{ display: 'inline-block', marginLeft: 8 }}>{t('noInternetPopup.title')}</span>
    </Styled.Container>
  );
}

export default NoInternetPopup;
