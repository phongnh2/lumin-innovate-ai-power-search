import { Text, IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { useMatch } from 'react-router';

import { ButtonColor, ButtonSize } from 'luminComponents/ButtonMaterial';
import Icomoon from 'luminComponents/Icomoon';
import ScrollAreaAutoSize from 'luminComponents/ScrollAreaAutoSize';

import { useEnableWebReskin, useMobileMatch, useTranslation } from 'hooks';
import useRestrictBillingActions from 'hooks/useRestrictBillingActions';

import { dateUtil, renderInvoiceAmount } from 'utils';

import { PaymentCurrency } from 'constants/plan.enum';
import { Routers } from 'constants/Routers';
import { Colors } from 'constants/styles';

import * as Styled from './InvoiceHistory.styled';

import styles from './InvoiceHistory.module.scss';

function InvoiceHistory({ invoices, currency, displayInModal, clientId }) {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const isSettingBillingTab = Boolean(useMatch({ path: Routers.SETTINGS.BILLING, end: false }));
  const { isRestrictedOrg, openRestrictActionsModal } = useRestrictBillingActions({ orgId: clientId });
  const isMobile = useMobileMatch();

  if (isEnableReskin) {
    const renderListWithScroll = (children) =>
      displayInModal ? (
        <ScrollAreaAutoSize
          type="auto"
          scrollbars="y"
          classNames={{
            viewport: styles.viewport,
          }}
          // 93px = height of modal title + height of table header
          mah="calc(100vh - var(--modal-y-offset) * 2 - var(--kiwi-spacing-3) * 2 - 93px)"
        >
          {children}
        </ScrollAreaAutoSize>
      ) : (
        children
      );

    const renderDownloadButton = (invoice) => (
      <IconButton
        variant="elevated"
        size="md"
        w="fit-content"
        icon="move-to-bottom-md"
        iconColor="var(--kiwi-colors-core-secondary)"
        data-cy="download_invoice_cta"
        onClick={() => window.open(invoice.downloadLink, '_blank')}
      />
    );

    const renderDesktopRow = (invoice) => (
      <div
        key={invoice.id}
        className={styles.itemWrapper}
        data-setting-billing-tab={isSettingBillingTab}
        data-modal={displayInModal}
      >
        <Text className={styles.cell} type="title" size="sm">
          {invoice.id}
        </Text>
        <Text className={styles.cell} type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {dateUtil.formatFullTime(new Date(invoice.created * 1000))}
        </Text>
        <Text className={styles.cell} type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
          {renderInvoiceAmount(invoice.total, currency)}
        </Text>
        {renderDownloadButton(invoice)}
      </div>
    );

    const renderMobileRow = (invoice) => (
      <div key={invoice.id} className={styles.itemWrapperMobile} data-modal={displayInModal}>
        <div className={styles.section}>
          <Text className={styles.cell} type="title" size="sm">
            {invoice.id}
          </Text>
          <Text className={styles.cell} type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {renderInvoiceAmount(invoice.total, currency)}
          </Text>
        </div>
        <div className={styles.section}>
          <Text className={styles.cell} type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
            {dateUtil.formatFullTime(new Date(invoice.created * 1000))}
          </Text>
          {renderDownloadButton(invoice)}
        </div>
      </div>
    );

    return (
      <div className={styles.container} data-modal={displayInModal}>
        {!isMobile && (
          <div className={styles.header} data-modal={displayInModal} data-setting-billing-tab={isSettingBillingTab}>
            <Text type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('orgDashboardBilling.invoiceId')}
            </Text>
            <Text className={styles.date} type="title" size="sm" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('orgDashboardBilling.date')}
            </Text>
            <Text
              className={styles.amount}
              type="title"
              size="sm"
              color="var(--kiwi-colors-surface-on-surface-variant)"
            >
              {t('orgDashboardBilling.amount')}
            </Text>
          </div>
        )}
        {renderListWithScroll(invoices.map(isMobile ? renderMobileRow : renderDesktopRow))}
      </div>
    );
  }

  return (
    <>
      <Styled.Header>
        <span>{t('orgDashboardBilling.invoiceId')}</span>
        <span>{t('orgDashboardBilling.date')}</span>
        <span>{t('orgDashboardBilling.amount')}</span>
      </Styled.Header>
      <div>
        {invoices.map((invoice) => (
          <Styled.BillingRow key={invoice.id}>
            <Styled.Id title={invoice.id}>{invoice.id}</Styled.Id>
            <span>{dateUtil.formatFullTime(new Date(invoice.created * 1000))}</span>
            <span>{renderInvoiceAmount(invoice.total, currency)}</span>
            <Styled.Button
              color={ButtonColor.HYPERLINK}
              size={ButtonSize.SM}
              onClick={() => {
                if (isRestrictedOrg) {
                  openRestrictActionsModal();
                  return;
                }
                window.open(invoice.downloadLink, '_blank');
              }}
            >
              <Icomoon size={18} className="download-3" color={Colors.SECONDARY_50} />
              <span>{t('common.download')}</span>
            </Styled.Button>
          </Styled.BillingRow>
        ))}
      </div>
    </>
  );
}

InvoiceHistory.propTypes = {
  invoices: PropTypes.array.isRequired,
  currency: PropTypes.string,
  displayInModal: PropTypes.bool,
  clientId: PropTypes.string,
};

InvoiceHistory.defaultProps = {
  currency: PaymentCurrency.USD,
  displayInModal: false,
  clientId: '',
};

export default InvoiceHistory;
