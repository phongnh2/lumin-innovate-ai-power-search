import classNames from 'classnames';
import { PlainTooltip, Button, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';

import { SubscriptionBadge } from 'screens/OrganizationDashboard/components/SubscriptionBadge';

import Tooltip from 'lumin-components/Shared/Tooltip';
import Icomoon from 'luminComponents/Icomoon';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { Colors } from 'constants/styles';

import styles from '../../../OrganizationSecurity.module.scss';
import * as Styled from '../../../OrganizationSecurity.styled';

const ButtonAddDomain = ({ isDisabledAddDomain, handleOpenAddModal, canCreate }) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const disabled = isDisabledAddDomain || !canCreate;

  if (isEnableReskin) {
    return (
      <PlainTooltip content={isDisabledAddDomain ? t('orgSettings.numberOfDomainsReachesTheLimit') : ''}>
        <div className={styles.addDomainButtonWrapper}>
          <Button
            variant="text"
            onClick={handleOpenAddModal}
            disabled={disabled}
            startIcon={<KiwiIcomoon type="plus-md" size="md" />}
            classNames={{
              root: classNames(styles.buttonInner, !disabled && styles.addDomainButton),
            }}
          >
            {t('orgSettings.addNewDomain')}
          </Button>
          {!canCreate && <SubscriptionBadge elementName={ButtonName.SECURITY_ASSOCIATED_DOMAIN_ADD} />}
        </div>
      </PlainTooltip>
    );
  }

  return (
    <Tooltip title={isDisabledAddDomain ? t('orgSettings.numberOfDomainsReachesTheLimit') : ''}>
      <Styled.ButtonAddDomainWrapper>
        <Styled.ButtonAddDomain onClick={handleOpenAddModal} disabled={isDisabledAddDomain || !canCreate}>
          <Icomoon className="plus-thin" color={Colors.SECONDARY_50} size={16} />
          <Styled.TextButtonAddDomain>{t('orgSettings.addNewDomain')}</Styled.TextButtonAddDomain>
        </Styled.ButtonAddDomain>
        {!canCreate && <SubscriptionBadge elementName={ButtonName.SECURITY_ASSOCIATED_DOMAIN_ADD} />}
      </Styled.ButtonAddDomainWrapper>
    </Tooltip>
  );
};

ButtonAddDomain.propTypes = {
  isDisabledAddDomain: PropTypes.bool,
  handleOpenAddModal: PropTypes.func,
  canCreate: PropTypes.bool,
};

ButtonAddDomain.defaultProps = {
  isDisabledAddDomain: false,
  handleOpenAddModal: () => {},
  canCreate: false,
};

export default ButtonAddDomain;
