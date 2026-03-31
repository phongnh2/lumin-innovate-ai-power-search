import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import { BadRequestPage } from '@new-ui/components/BadRequestPage';

import CrashImageNew from 'assets/images/crash-page-new.svg';
import CrashImageDark from 'assets/images/dark-crash-page.svg';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetImageByTheme, useTranslation } from 'hooks';

import logger from 'helpers/logger';

import { ButtonBadRequestPage, BadRequestPageType } from 'constants/badRequestPage';

function Crash(props) {
  const { onOk, error } = props;
  const { t } = useTranslation();
  const crashImage = useGetImageByTheme(CrashImageNew, CrashImageDark);

  const onClick = () => {
    if (typeof onOk === 'function') {
      onOk();
    } else {
      window.location.reload();
    }
  };

  const renderFooterButtons = () => (
    <Button {...ButtonBadRequestPage.FilledLargeSystem} onClick={onClick}>
      {t('common.retry')}
    </Button>
  );

  useEffect(() => {
    logger.logInfo({
      reason: 'Crash page',
      message: 'Crash page is displayed',
    });
  }, []);

  return (
    <LayoutSecondary footer={false} staticPage badRequestLayout>
      <BadRequestPage
        id={BadRequestPageType.Crash}
        title={t('common.somethingWentWrong')}
        image={crashImage}
        description={t('crash.description')}
        buttons={renderFooterButtons()}
        error={error}
        flexEnd
      />
    </LayoutSecondary>
  );
}

Crash.propTypes = {
  onOk: PropTypes.func,
  error: PropTypes.object,
};

export default Crash;
