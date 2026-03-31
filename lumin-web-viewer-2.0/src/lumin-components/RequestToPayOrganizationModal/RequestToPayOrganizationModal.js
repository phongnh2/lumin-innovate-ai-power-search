import { Modal } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';
import { connect } from 'react-redux';

import TransferOwnership from 'assets/reskin/images/transfer-ownership.png';

import selectors from 'selectors';

import ModalFooter from 'lumin-components/ModalFooter';
import Dialog from 'luminComponents/Dialog';
import SvgElement from 'luminComponents/SvgElement';

import { useEnableWebReskin, useTranslation } from 'hooks';
import { useGetPricingBaseOnPlan } from 'hooks/pricingRefactors';

import { paymentUtil, numberUtils } from 'utils';

import { ModalSize } from 'constants/styles/Modal';

import {
  StyledTitle,
  StyledDesc,
  StyledMainIcon,
  StyledFooter,
  StyledOrganizationName,
  StyledPriceWrapper,
  StyledTotalPrice,
} from './RequestToPayOrganizationModal.styled';

import styles from './RequestToPayOrganizationModal.module.scss';

const propTypes = {
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  currentOrganization: PropTypes.object.isRequired,
  getNewMemberCount: PropTypes.func.isRequired,
};
const defaultProps = {
  onConfirm: () => {},
  onCancel: () => {},
};

const RequestToPayOrganizationModal = ({ onCancel, onConfirm, currentOrganization, getNewMemberCount }) => {
  const {
    name: organizationName,
    payment: { currency, period, type, priceVersion },
  } = currentOrganization;
  const { price } = useGetPricingBaseOnPlan({ period, plan: type, priceVersion, organization: currentOrganization });
  const currencySymbol = paymentUtil.convertCurrencySymbol(currency);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const onConfirmWithLoading = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  if (isEnableReskin) {
    return (
      <Modal
        opened
        onClose={onCancel}
        title={t('memberPage.requestToPayModal.title')}
        titleCentered
        Image={<img src={TransferOwnership} alt="request-to-pay" style={{ height: 90 }} />}
        onConfirm={onConfirmWithLoading}
        onCancel={onCancel}
        isProcessing={loading}
        confirmButtonProps={{
          title: t('common.confirm'),
        }}
        cancelButtonProps={{
          title: t('common.cancel'),
        }}
      >
        <div className={styles.descriptionWrapper}>
          <span className="kiwi-message--primary">{organizationName}{' '}</span>
          <Trans
            i18nKey="memberPage.requestToPayModal.description"
            components={{ b: <b className="kiwi-message--primary" /> }}
            values={{ currencySymbol, price: numberUtils.formatDecimal(price) }}
          />
          <div className={styles.chargeWrapper}>
            <Trans
              i18nKey="memberPage.requestToPayModal.description1"
              components={{ b: <b className="kiwi-message--primary" /> }}
              values={{
                currencySymbol,
                price: numberUtils.formatDecimal(price * getNewMemberCount()),
                member: getNewMemberCount(),
              }}
            />
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Dialog open onClose={onCancel} disableBackdropClick={loading} disableEscapeKeyDown={loading} width={ModalSize.SM}>
      <div>
        <StyledMainIcon>
          <SvgElement content="icon-info" width={48} height={48} />
        </StyledMainIcon>

        <StyledTitle>{t('memberPage.requestToPayModal.title')}</StyledTitle>
        <StyledDesc>
          <StyledOrganizationName>{organizationName}</StyledOrganizationName>{' '}
          <Trans
            i18nKey="memberPage.requestToPayModal.description"
            components={{ b: <b /> }}
            values={{ currencySymbol, price: numberUtils.formatDecimal(price) }}
          />
        </StyledDesc>

        <StyledPriceWrapper>
          <Trans
            i18nKey="memberPage.requestToPayModal.description1"
            components={{ b: <StyledTotalPrice /> }}
            values={{
              currencySymbol,
              price: numberUtils.formatDecimal(price * getNewMemberCount()),
              member: getNewMemberCount(),
            }}
          />
        </StyledPriceWrapper>

        <StyledFooter>
          <ModalFooter
            onSubmit={onConfirmWithLoading}
            loading={loading}
            label={t('common.confirm')}
            onCancel={onCancel}
            disabledCancel={loading}
            smallGap
          />
        </StyledFooter>
      </div>
    </Dialog>
  );
};

RequestToPayOrganizationModal.propTypes = propTypes;
RequestToPayOrganizationModal.defaultProps = defaultProps;

const mapStateToProps = (state, { selectedOrganization }) => ({
  currentOrganization: selectedOrganization || selectors.getCurrentOrganization(state).data,
});

export default connect(mapStateToProps)(RequestToPayOrganizationModal);
