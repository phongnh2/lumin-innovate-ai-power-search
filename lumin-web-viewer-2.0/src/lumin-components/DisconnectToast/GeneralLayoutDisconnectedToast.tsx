import React from 'react';

import HangingInViewport from '@new-ui/components/HangingInViewport/HangingInViewport';
import InlineAlert from '@new-ui/general-components/InlineAlert/InlineAlert';

import { useTranslation } from 'hooks/useTranslation';

import * as Styled from './DisconnectToast.styled';

const GeneralLayoutDisconnectedToast = () => {
  const { t } = useTranslation();
  return (
    <HangingInViewport>
      <InlineAlert
        extra={
          <Styled.ExtraWrapper>
            <Styled.ExtraContent>{t('viewer.disconnectToast.retrying')}</Styled.ExtraContent>
          </Styled.ExtraWrapper>
        }
        type="error"
        title={t('viewer.disconnectToast.lostConnection')}
        icon="md_status_warning"
      />
    </HangingInViewport>
  );
};

export default GeneralLayoutDisconnectedToast;
