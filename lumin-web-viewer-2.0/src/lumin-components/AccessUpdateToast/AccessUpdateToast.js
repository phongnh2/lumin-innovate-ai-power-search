import { PropTypes } from 'prop-types';
import React from 'react';

import HangingInViewport from '@new-ui/components/HangingInViewport/HangingInViewport';
import InlineAlert from '@new-ui/general-components/InlineAlert/InlineAlert';

import { useTranslation } from 'hooks';

const AccessUpdateToast = ({ title, reloadDocument }) => {
  const { t } = useTranslation();
  const onClick = () => {
    if (title) {
      reloadDocument();
    } else {
      window.location.reload();
    }
  };
  const actualTitle = title || t('viewer.accessUpdated');
  return (
    <HangingInViewport>
      <InlineAlert
        type="info"
        title={actualTitle}
        onBtnClick={onClick}
        btnTitle={t('common.reload')}
        icon="md_status_warning"
      />
    </HangingInViewport>
  );
};

AccessUpdateToast.propTypes = {
  title: PropTypes.string,
  reloadDocument: PropTypes.func.isRequired,
};

AccessUpdateToast.defaultProps = {
  title: '',
};

export default AccessUpdateToast;
