import { InfoIcon } from '@luminpdf/icons/dist/csr/Info';
import React from 'react';
import { Trans } from 'react-i18next';

import { useTranslation } from 'hooks';
import { useTrackingBannerEvent } from 'hooks/useTrackingBannerEvent';

import { BannerName } from 'utils/Factory/EventCollection/BannerEventCollection';

import { Routers } from 'constants/Routers';
import { STATIC_PAGE_URL } from 'constants/urls';

import SemanticTopBanner from '../SemanticTopBanner';

import style from './InformLegacySubscriptionTransition.module.scss';

const InformLegacySubscriptionTransition = ({ handleCloseBanner }: { handleCloseBanner: () => void }) => {
  const { t } = useTranslation();

  useTrackingBannerEvent({
    bannerName: BannerName.INFORM_LEGACY_SUBSCRIPTION_TRANSITION,
    bannerPurpose: '',
  });

  return (
    <SemanticTopBanner
      type="info"
      leftIcon={<InfoIcon color="var(--kiwi-colors-semantic-information)" weight="fill" size={24} />}
      content={
        <Trans
          i18nKey="legacyCustomerMigration"
          components={{
            a: (
              // eslint-disable-next-line jsx-a11y/control-has-associated-label, jsx-a11y/anchor-has-content
              <a
                className={style.termsLink}
                target="_blank"
                href={`${STATIC_PAGE_URL}${Routers.PRICING_LUMIN}`}
                rel="noopener noreferrer"
              />
            ),
            b: <span className="bold" />,
          }}
        />
      }
      cancelButtonTitle={t('action.close')}
      onCancel={handleCloseBanner}
    />
  );
};

export default InformLegacySubscriptionTransition;
