import { Icomoon, Button } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useTranslation, useMobileMatch } from 'hooks';
import { useUrlSearchParams } from 'hooks/useUrlSearchParams';

import { Routers } from 'constants/Routers';
import { UrlSearchParam } from 'constants/UrlSearchParam';

import styles from './UnifyPaymentLayout.module.scss';

type UnifyPaymentLayoutProps = {
  children: React.ReactNode;
};

const UnifyPaymentLayout = ({ children }: UnifyPaymentLayoutProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobileMatch = useMobileMatch();
  const searchParams = useUrlSearchParams();
  const returnTo = searchParams.get(UrlSearchParam.RETURN_TO);

  const hasDomainInUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return Boolean(urlObj.host);
    } catch {
      return false;
    }
  };

  const handleBack = () => {
    if (!returnTo) {
      navigate(Routers.ROOT);
      return;
    }

    if (!hasDomainInUrl(returnTo)) {
      navigate(returnTo);
      return;
    }

    window.location.href = returnTo;
  };

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.buttonWrapper}>
          <Button
            variant="text"
            size={isMobileMatch ? 'md' : 'lg'}
            startIcon={<Icomoon type="chevron-left-lg" color="var(--kiwi-colors-core-secondary)" size="lg" />}
            onClick={handleBack}
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
      {children}
    </section>
  );
};

export default UnifyPaymentLayout;
