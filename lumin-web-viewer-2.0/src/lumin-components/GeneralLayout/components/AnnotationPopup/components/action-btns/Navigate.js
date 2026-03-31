import React, { useContext } from 'react';

import IconButton from 'lumin-components/GeneralLayout/general-components/IconButton';

import { useTranslation } from 'hooks';

import { AnnotationPopupContext } from '../../AnnotationPopupContext';
import useAnnotationPopupAction from '../../hooks/useAnnotationPopupAction';
import useAnnotationPopupBtnCondition from '../../hooks/useAnnotationPopupBtnCondition';

const Navigate = () => {
  const { clickHyperLink } = useAnnotationPopupAction();
  const { pageDest } = useContext(AnnotationPopupContext);
  const { t } = useTranslation();
  const { showNavigateButton } = useAnnotationPopupBtnCondition();

  return showNavigateButton ? (
    <IconButton
      dataElement="navigateLinkButton"
      icon="md_navigator"
      iconSize={24}
      onClick={clickHyperLink}
      // eslint-disable-next-line no-magic-numbers
      disabled={pageDest?.page === 0}
      tooltipData={{ location: 'bottom', title: t('action.navigate') }}
    />
  ) : null;
};

Navigate.propTypes = {};

export default Navigate;
