import PropTypes from 'prop-types';
import React from 'react';

import LuminButton from 'lumin-components/LuminButton';
import SvgElement from 'lumin-components/SvgElement';

import { useTranslation } from 'hooks';
import useDocumentTools from 'hooks/useDocumentTools';

import './PermissionPopperContent.scss';

const PermissionPopperContent = ({ closePopper }) => {
  const { t } = useTranslation();
  const { handleRequestSharePermission } = useDocumentTools();
  return (
    <div className="request-popper">
      <SvgElement content="request-permission" width={48} height={48} />
      <div className="request-popper__title">{t('openDrive.permissionRequired')}</div>
      <div className="request-popper__description">{t('viewer.onlySharePermission')}</div>
      <LuminButton
        className="request-popper__button"
        onClick={() => {
          closePopper();
          handleRequestSharePermission();
        }}
      >
        {t('viewer.requestShareAccess')}
      </LuminButton>
    </div>
  );
};

PermissionPopperContent.propTypes = {
  closePopper: PropTypes.func,
};

PermissionPopperContent.defaultProps = {
  closePopper: () => {},
};
export default PermissionPopperContent;
