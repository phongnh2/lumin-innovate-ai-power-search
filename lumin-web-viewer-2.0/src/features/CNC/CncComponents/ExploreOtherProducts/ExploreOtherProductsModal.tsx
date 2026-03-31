import { AgreementGen } from '@luminpdf/icons/dist/csr/AgreementGen';
import { FilesIcon as DocumentIcon } from '@luminpdf/icons/dist/csr/Files';
import { LogoLumin } from '@luminpdf/icons/dist/csr/LogoLumin';
import { LogoSign } from '@luminpdf/icons/dist/csr/LogoSign';
import classNames from 'classnames';
import { Dialog, Divider, Text, Icomoon, Link, Button, Checkbox, Badge, Chip, Skeleton } from 'lumin-ui/kiwi-ui';
import React, { useEffect, useState } from 'react';
import { Trans } from 'react-i18next';

import agreementGenIllustration from 'assets/images/agreement-gen-illustration.png';
import documentsIllustration from 'assets/images/documents-illustration.png';
import luminPdfIllustration from 'assets/images/lumin-pdf-illustration.png';
import luminSignIllustration from 'assets/images/lumin-sign-illustration.png';

import { useTranslation } from 'hooks';
import useGetOwnCurrentDoc from 'hooks/useGetOwnCurrentDoc';

import { PRODUCTS } from 'features/CNC/constants/customConstant';
import { CNCButtonName } from 'features/CNC/constants/events/button';

import { ORG_TEXT } from 'constants/organizationConstants';
import { PaymentPlans, PlanTypeLabel } from 'constants/plan.enum';
import { SIGN_APP_URL, AGREEMENT_GEN_APP_URL } from 'constants/urls';

import {
  getLogoActiveStateClassname,
  getTabActiveStateClassname,
  getProductTabInfo,
  getCtaProps,
  getTrialPlan,
} from './helpers';

import styles from './ExploreOtherProductsModal.module.scss';

interface ExploreOtherProductsModalProps {
  onClickStartTrial: ({ skip }: { skip: boolean }) => void;
  onClose?: ({ skip }: { skip: boolean }) => void;
}
type ProductType = typeof PRODUCTS[keyof typeof PRODUCTS];

const products = [
  {
    key: PRODUCTS.LUMIN_PDF,
    logo: <LogoLumin size={24} />,
    illustrationImg: luminPdfIllustration,
    illustrationHeight: 245,
  },
  {
    key: PRODUCTS.LUMIN_SIGN,
    logo: <LogoSign size={24} />,
    illustrationImg: luminSignIllustration,
    illustrationHeight: 245,
  },
  {
    key: PRODUCTS.AGREEMENT_GEN,
    logo: (
      <AgreementGen size={24}>
        <defs>
          <linearGradient
            id="paint0_linear_1638_6311"
            x1="12"
            y1="-2.48502"
            x2="12"
            y2="28.3956"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FD8EA1" />
            <stop offset="1" stopColor="#928AFF" />
          </linearGradient>
        </defs>
      </AgreementGen>
    ),
    illustrationImg: agreementGenIllustration,
    illustrationHeight: 339,
  },
  {
    key: PRODUCTS.DOCUMENTS,
    logo: <DocumentIcon size={24} />,
    illustrationImg: documentsIllustration,
    illustrationHeight: 273,
  },
];

const planTypeMapping = () => ({
  [PaymentPlans.ORG_PRO]: 'orgPro',
  [PaymentPlans.ORG_BUSINESS]: 'orgBusiness',
});

const renderFeatures = (features: string[]) => {
  if (features.length === 0) return null;

  return (
    <div className={styles.featuresContainer}>
      {features.map((feature) => (
        <Text
          type="body"
          size="md"
          key={feature}
          className={styles.features}
          color="var(--kiwi-colors-surface-on-surface-variant)"
        >
          <Icomoon type="checkbox-lg" size="lg" color="var(--kiwi-colors-semantic-success)" />
          {feature}
        </Text>
      ))}
    </div>
  );
};

const ExploreOtherProductsModal = ({ onClose, onClickStartTrial }: ExploreOtherProductsModalProps) => {
  const [skip, setSkip] = useState(false);
  const [currentTab, setCurrentTab] = useState<ProductType>(PRODUCTS.LUMIN_PDF);
  const [isIllustrationLoading, setIsIllustrationLoading] = useState(true);
  const { t } = useTranslation();
  const { organization: orgOwnCurrentDocument } = useGetOwnCurrentDoc();
  const { url: orgUrl } = orgOwnCurrentDocument;

  const handleSetCurrentTab = (tab: ProductType) => {
    setCurrentTab(tab);
  };
  const handleSkipFreeTrialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkip(e.target.checked);
  };
  const getCtaHandler = (key: string) => {
    switch (key) {
      case PRODUCTS.LUMIN_PDF:
        return () => onClickStartTrial({ skip });
      case PRODUCTS.LUMIN_SIGN:
        return () =>
          window.open(`${SIGN_APP_URL}/${ORG_TEXT}/${orgUrl}/dashboard?from=modal_explore_lumin_ecosystem`, '_blank');
      case PRODUCTS.AGREEMENT_GEN:
        return () => window.open(`${AGREEMENT_GEN_APP_URL}/documents?from=modal_explore_lumin_ecosystem`, '_blank');
      case PRODUCTS.DOCUMENTS:
        return () =>
          window.open(`/${ORG_TEXT}/${orgUrl}/documents/${ORG_TEXT}?from=modal_explore_lumin_ecosystem`, '_blank');
      default:
        return () => {};
    }
  };

  const { ctaTitle, ctaName, helpUrl, helpBtnName, helpBtnPurpose } = getCtaProps(currentTab, t);
  const ctaHandler = getCtaHandler(currentTab);
  const trialPlan = getTrialPlan(orgOwnCurrentDocument);
  const planType = planTypeMapping()[trialPlan as keyof typeof planTypeMapping] || 'orgPro';
  const features: string[] =
    t(`exploreOtherProducts.products.${currentTab}.features`, {
      returnObjects: true,
      planType,
    }) || [];
  const planTypeLabel = PlanTypeLabel[trialPlan];
  const { illustrationImg, illustrationHeight } = products.find((product) => product.key === currentTab) || {};

  useEffect(() => {
    setIsIllustrationLoading(true);
  }, [currentTab]);

  return (
    <Dialog
      size="lg"
      opened
      closeOnClickOutside={false}
      closeOnEscape={false}
      onClose={() => onClose({ skip })}
      withCloseButton
      headerTitle={
        <Text type="headline" size="lg">
          {t('exploreOtherProducts.header')}
        </Text>
      }
      padding="none"
      headerTitleContainerProps={{
        className: styles.modalHeader,
      }}
      closeButtonProps={{
        className: styles.closeButton,
      }}
      classNames={{
        content: styles.dialogContent,
      }}
      styles={{
        inner: {
          zIndex: 'var(--zindex-modal-low)',
        },
        overlay: {
          zIndex: 'var(--zindex-modal-low)',
        },
        body: {
          display: 'flex',
        },
      }}
    >
      <Divider />
      <div className={styles.modalBody}>
        <div className={styles.leftPanel} role="tabpanel">
          {products.map((product) => {
            const { tabPurpose, tabName } = getProductTabInfo(product.key);

            return (
              <div
                role="tablist"
                tabIndex={0}
                key={product.key}
                className={classNames(
                  styles.productSummary,
                  product.key === currentTab ? getTabActiveStateClassname(product.key) : null
                )}
                onClick={() => {
                  handleSetCurrentTab(product.key);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSetCurrentTab(product.key);
                  }
                }}
                data-lumin-btn-name={tabName}
                data-lumin-btn-purpose={tabPurpose}
              >
                <div
                  className={classNames(
                    styles.productLogo,
                    currentTab === product.key ? getLogoActiveStateClassname(product.key) : null
                  )}
                >
                  {product.logo}
                </div>
                <div>
                  <Text
                    type="headline"
                    size="sm"
                    color="var(--kiwi-colors-surface-on-surface)"
                    className={styles.shortHeader}
                  >
                    <Trans
                      i18nKey={`exploreOtherProducts.products.${product.key}.shortHeader`}
                      components={{
                        Text: <Badge size="xs" variant="outline" />,
                        br: <br style={{ display: 'none' }} />,
                      }}
                    />
                  </Text>
                  <Text
                    type="label"
                    size="sm"
                    color="var(--kiwi-colors-surface-on-surface-variant)"
                    className={styles.shortDescription}
                  >
                    {t(`exploreOtherProducts.products.${product.key}.shortDescription`)}
                  </Text>
                </div>
              </div>
            );
          })}
          <div className={styles.skipFreeTrial}>
            <Checkbox
              onChange={handleSkipFreeTrialChange}
              checked={skip}
              data-lumin-btn-name={CNCButtonName.DONT_SHOW_THIS_AGAIN}
              size="sm"
            />
            <Text type="body" size="md" color="var(--kiwi-colors-surface-on-surface-variant)">
              {t('common.doNotShowAgain')}
            </Text>
          </div>
        </div>
        <Divider orientation="vertical" />
        <div className={styles.rightPanel}>
          <div className={styles.illustrationContainer}>
            {isIllustrationLoading && <Skeleton variant="rectangular" height={illustrationHeight} />}
            <img
              src={illustrationImg}
              alt={`${currentTab}-illustration`}
              className={styles.illustrationImage}
              onLoad={() => setIsIllustrationLoading(false)}
              onError={() => setIsIllustrationLoading(false)}
              style={{ display: isIllustrationLoading ? 'none' : 'block', height: illustrationHeight }}
            />
            <Text
              type="headline"
              size="lg"
              className={classNames(styles.longHeader, {
                [styles.agreementGenLongHeader]: currentTab === PRODUCTS.AGREEMENT_GEN,
              })}
              color="var(--kiwi-colors-surface-on-surface)"
            >
              <Trans
                i18nKey={`exploreOtherProducts.products.${currentTab}.longHeader`}
                components={{
                  Chip: (
                    <Chip
                      variant="light"
                      label={planTypeLabel}
                      className={classNames(styles.chip, 'kiwi-typography-title-xs')}
                    />
                  ),
                }}
                values={{ planTypeLabel }}
              />
            </Text>
            <Text
              type="body"
              size="lg"
              className={styles.longDescription}
              color="var(--kiwi-colors-surface-on-surface-variant)"
            >
              {t(`exploreOtherProducts.products.${currentTab}.longDescription`, { planTypeLabel })}
            </Text>
            {renderFeatures(features)}
          </div>
          <div className={styles.rightPanelBottom}>
            <Divider />
            <div className={styles.ctaContainer}>
              <Text type="label" size="sm" color="var(--kiwi-colors-surface-on-surface-low)">
                {t(`exploreOtherProducts.howToUse`)}
                &nbsp;
                <Trans
                  i18nKey={`exploreOtherProducts.products.${currentTab}.shortHeader`}
                  components={{
                    Text: <p style={{ display: 'none' }} />,
                    br: <br />,
                  }}
                />
                ?
              </Text>
              &nbsp;
              <Link
                href={helpUrl}
                target="_blank"
                data-lumin-btn-name={helpBtnName}
                data-lumin-btn-purpose={helpBtnPurpose}
                className={styles.getHelp}
              >
                {t('common.getHelp')}
              </Link>
              <Button className={styles.cta} onClick={ctaHandler} data-lumin-btn-name={ctaName} size="lg">
                {ctaTitle}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ExploreOtherProductsModal;
