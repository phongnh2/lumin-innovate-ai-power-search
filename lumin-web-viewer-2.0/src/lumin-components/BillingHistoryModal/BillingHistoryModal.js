import { Dialog as KiwiDialog, IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';

import Dialog from 'lumin-components/Dialog';
import InvoiceHistory from 'lumin-components/InvoiceHistory';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { PaymentCurrency } from 'constants/plan.enum';
import { Colors } from 'constants/styles';

import * as Styled from './BillingHistoryModal.styled';

import styles from './BillingHistoryModal.module.scss';

function BillingHistoryModal({ open, onClose, invoices, currency, clientId }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  if (isEnableReskin) {
    return (
      open && (
        <KiwiDialog
          size="md"
          opened
          centered
          onClose={onClose}
          classNames={{
            root: styles.root,
            body: styles.body,
          }}
        >
          <div className={styles.header}>
            <p className={styles.title}>{t('orgDashboardBilling.billingHistory')}</p>
            <IconButton className={styles.closeButton} size="lg" icon="x-lg" onClick={onClose} />
          </div>
          <InvoiceHistory invoices={invoices} currency={currency} displayInModal />
        </KiwiDialog>
      )
    );
  }

  return (
    <Dialog open={open} onClose={onClose} width={700}>
      <Styled.Wrapper>
        <Styled.Header>
          <Styled.Title>{t('orgDashboardBilling.billingHistory')}</Styled.Title>
          <Styled.Button
            size={32}
            onClick={onClose}
            rounded
            icon="cancel"
            iconSize={14}
            iconColor={Colors.NEUTRAL_80}
          />
        </Styled.Header>
        <Scrollbars autoHide autoHeight autoHeightMax={500}>
          <Styled.Content>
            <InvoiceHistory clientId={clientId} invoices={invoices} currency={currency} />
          </Styled.Content>
        </Scrollbars>
      </Styled.Wrapper>
    </Dialog>
  );
}

BillingHistoryModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  invoices: PropTypes.array.isRequired,
  currency: PropTypes.string,
  clientId: PropTypes.string,
};

BillingHistoryModal.defaultProps = {
  currency: PaymentCurrency.USD,
  clientId: '',
};

export default BillingHistoryModal;
