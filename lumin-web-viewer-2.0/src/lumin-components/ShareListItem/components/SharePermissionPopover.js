// eslint-disable-next-line import/no-unresolved
import { TrashIcon } from '@luminpdf/icons/dist/csr/Trash';
import { MenuItem } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { getDocumentSharingPermission } from 'utils';

import { LOGGER } from 'constants/lumin-common';

import styles from './SharePermissionPopover.module.scss';

const PermissionContent = ({ value, onChangePermission, handleRemoveMember, canDelete }) => {
  const { t } = useTranslation();
  const permissions = getDocumentSharingPermission(t);
  const roles = Object.values(permissions);

  return (
    <>
      {roles.map(
        (item) =>
          value !== item.role && (
            <MenuItem
              key={item.role}
              leftSection={<div className={styles.iconWrapper}>{item.icon}</div>}
              value={item.role}
              onClick={() => onChangePermission(item.role)}
              data-cy={`share_permision_${item.role}`}
            >
              {item.text}
            </MenuItem>
          )
      )}
      {canDelete && (
        <MenuItem
          key="delete"
          leftSection={
            <div className={styles.iconWrapper}>
              <TrashIcon height={20} width={20} />
            </div>
          }
          value="delete"
          onClick={handleRemoveMember}
          data-cy="share_permision_delete"
        >
          {t('common.remove')}
        </MenuItem>
      )}
    </>
  );
};

PermissionContent.propTypes = {
  onChangePermission: PropTypes.func.isRequired,
  handleRemoveMember: PropTypes.func,
  value: PropTypes.string,
  canDelete: PropTypes.bool,
};
PermissionContent.defaultProps = {
  canDelete: false,
  value: null,
  handleRemoveMember: () => {},
};

const SharePermissionPopover = (props) => {
  const { value, canDelete, handleChangePermission, handleRemoveMember } = props;
  const onChangePermission = (role) => {
    logger.logInfo({
      message: LOGGER.EVENT.CHANGE_PERMISSION,
      reason: LOGGER.Service.HIGH_RISK_FUNCTIONALITY_INFO,
    });
    handleChangePermission(role);
  };

  return (
    <PermissionContent
      value={value}
      canDelete={canDelete}
      onChangePermission={onChangePermission}
      handleRemoveMember={handleRemoveMember}
    />
  );
};

SharePermissionPopover.propTypes = {
  handleChangePermission: PropTypes.func.isRequired,
  handleRemoveMember: PropTypes.func,
  value: PropTypes.string.isRequired,
  canDelete: PropTypes.bool,
};
SharePermissionPopover.defaultProps = {
  canDelete: false,
  handleRemoveMember: () => {},
};

export default React.memo(SharePermissionPopover);
