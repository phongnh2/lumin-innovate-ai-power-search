import { Query } from '@apollo/client/react/components';
import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Trans } from 'react-i18next';

import { INVOICES } from 'graphQL/PaymentGraph';

import Loading from 'lumin-components/Loading';
import BillingHistoryModal from 'luminComponents/BillingHistoryModal';
import InvoiceHistory from 'luminComponents/InvoiceHistory';

import { useEnableWebReskin, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';

import { commonUtils } from 'utils';

import { CURRENCY } from 'constants/paymentConstant';
import { PaymentTypes } from 'constants/plan';

import * as Styled from './BillingInvoice.styled';

import styles from './BillingInvoice.module.scss';

const MAXIMUM_DISPLAY_ROW = 4;

function BillingInvoice({ clientId, currency, paymentType }) {
  const { t } = useTranslation();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { isEnableReskin } = useEnableWebReskin();

  const { onKeyDown } = useKeyboardAccessibility();

  const renderContent = (invoices) => {
    if (isEnableReskin) {
      return (
        <div>
          <Text className={styles.title} type="headline" size="md" color="var(--kiwi-colors-surface-on-surface)">
            {commonUtils.formatTitleCaseByLocale(t('orgDashboardBilling.billingHistory'))}
          </Text>
          <InvoiceHistory invoices={invoices.slice(0, MAXIMUM_DISPLAY_ROW)} currency={currency} />
          <div className={styles.footer}>
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              <Trans
                i18nKey="orgDashboardBilling.noteBillingHistory"
                components={{ b: <span className={styles.note} /> }}
              />
            </Text>
            {invoices.length > MAXIMUM_DISPLAY_ROW && (
              <Text
                role="button"
                tabIndex={0}
                className={styles.seeFullBilling}
                type="label"
                size="md"
                color="var(--kiwi-colors-semantic-information)"
                data-cy="view_full_billing_history_cta"
                onClick={() => setIsOpenModal(true)}
                onKeyDown={onKeyDown}
              >
                {t('orgDashboardBilling.seeFullBillingHistory')}
              </Text>
            )}
          </div>
          {invoices.length > MAXIMUM_DISPLAY_ROW && (
            <BillingHistoryModal
              currency={currency}
              open={isOpenModal}
              onClose={() => setIsOpenModal(false)}
              invoices={invoices}
            />
          )}
        </div>
      );
    }

    return (
      <>
        <Styled.Title>{commonUtils.formatTitleCaseByLocale(t('orgDashboardBilling.billingHistory'))}</Styled.Title>
        <InvoiceHistory clientId={clientId} invoices={invoices.slice(0, MAXIMUM_DISPLAY_ROW)} currency={currency} />
        <Styled.Note>
          <span>
            <Trans
              i18nKey="orgDashboardBilling.noteBillingHistory"
              components={{ b: <span className={styles.note} /> }}
            />
          </span>
          {invoices.length > MAXIMUM_DISPLAY_ROW && (
            <Styled.SeeFullInvoices onClick={() => setIsOpenModal(true)}>
              {t('orgDashboardBilling.seeFullBillingHistory')}
            </Styled.SeeFullInvoices>
          )}
        </Styled.Note>
        {invoices.length > MAXIMUM_DISPLAY_ROW && (
          <BillingHistoryModal
            clientId={clientId}
            currency={currency}
            open={isOpenModal}
            onClose={() => setIsOpenModal(false)}
            invoices={invoices}
          />
        )}
      </>
    );
  };

  return (
    <Query
      query={INVOICES}
      fetchPolicy="network-only"
      variables={{
        input: {
          clientId,
          type: paymentType,
        },
      }}
    >
      {({ loading, error, data }) => {
        if (error) return null;
        if (loading) {
          return (
            <Loading
              normal
              useReskinCircularProgress={isEnableReskin}
              containerStyle={isEnableReskin ? { padding: '78px 0' } : { marginTop: 50 }}
            />
          );
        }
        const invoices = data.invoices || [];
        if (!invoices.length) {
          return null;
        }
        return renderContent(invoices);
      }}
    </Query>
  );
}

BillingInvoice.propTypes = {
  clientId: PropTypes.string.isRequired,
  currency: PropTypes.string,
  paymentType: PropTypes.oneOf(Object.values(PaymentTypes)),
};

BillingInvoice.defaultProps = {
  currency: CURRENCY.USD,
  paymentType: PaymentTypes.INDIVIDUAL,
};

export default BillingInvoice;
