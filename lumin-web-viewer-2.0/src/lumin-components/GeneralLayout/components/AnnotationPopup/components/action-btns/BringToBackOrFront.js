import React from 'react';

import Divider from 'lumin-components/GeneralLayout/general-components/Divider';
import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const BringToBackOrFront = () => {
  const { bringToBackOrFront } = useAnnotationPopupAction();
  const { showReorderButton } = useAnnotationPopupBtnCondition();

  const { t } = useTranslation();

  return showReorderButton ? (
    <>
      <IconButton
        dataElement="bringToFrontButton"
        icon="md_bring_to_font"
        iconSize={24}
        onClick={() => bringToBackOrFront({ isBringToBack: false })}
        tooltipData={{ location: 'bottom', title: t('common.bringToFront') }}
      />

      <IconButton
        dataElement="sendToBackButton"
        icon="md_send_to_back"
        iconSize={24}
        onClick={() => bringToBackOrFront({ isBringToBack: true })}
        tooltipData={{ location: 'bottom', title: t('common.sendToBack') }}
      />

      <Divider orientation="vertical" style={{ height: 24 }} />
    </>
  ) : null;
};

BringToBackOrFront.propTypes = {};

export default BringToBackOrFront;
