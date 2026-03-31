import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';

const propTypes = {
  notification: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

const RemoveMember = ({ notification, currentUser }) => {
  const { t } = useTranslation();
  const isCurrentUser = notification.target.targetId === currentUser._id;
  const hasSignAgreements = notification.target.targetData?.existAgreement;
  const hasAgreementGenDocuments = notification.target.targetData?.existAgreementGenDocuments;

  if (isCurrentUser) {
    const hasAgreements = hasSignAgreements || hasAgreementGenDocuments;
    const baseValues = { entityName: notification.entity.name };
    const i18nKey = hasAgreements
      ? 'notification.notificationOrgItem.removedFromOrgWithAgreements'
      : 'notification.notificationOrgItem.removedFromOrg';

    const values = hasAgreements
      ? { ...baseValues, targetOrgName: notification.target.targetData.orgName }
      : baseValues;

    return (
      <span>
        <Trans shouldUnescape i18nKey={i18nKey} values={values} components={{ b: <b className="bold" /> }} />
      </span>
    );
  }

  return (
    <span>
      <Trans shouldUnescape i18nKey="notification.notificationOrgItem.removeMember">
        <span className="bold">{{ actorName: notification.actor.name }}</span> removed
        <span
          className={classNames({
            bold: !isCurrentUser,
          })}
        >
          {{
            targetName: isCurrentUser ? t('common.you').toLowerCase() : notification.target.targetName,
          }}
        </span>
        from
        <span className="bold">{{ entityName: notification.entity.name }}</span>
      </Trans>
    </span>
  );
};

RemoveMember.propTypes = propTypes;

export default RemoveMember;
