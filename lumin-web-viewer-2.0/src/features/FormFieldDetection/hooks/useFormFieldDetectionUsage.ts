import { get } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import selectors from 'selectors';

import { useShallowSelector } from 'hooks/useShallowSelector';

import { getFeatureResetTime } from '../utils/date';

export const useFormFieldDetectionUsage = () => {
  const { t } = useTranslation();
  const currentUser = useShallowSelector(selectors.getCurrentUser);

  const blockTime = get(currentUser, 'toolQuota.formFieldDetection.blockTime', null) as number | null;
  const isOverFFDQuota = get(currentUser, 'toolQuota.formFieldDetection.isExceeded', false);

  const overFFDQuotaMessage = useMemo(
    () =>
      isOverFFDQuota
        ? t('viewer.formFieldDetection.overQuotaTooltip.message', {
            resetTime: getFeatureResetTime({ blockTime, dataUpdatedAt: Date.now() }),
          })
        : '',
    [blockTime, isOverFFDQuota, t]
  );

  return {
    isOverFFDQuota,
    overFFDQuotaMessage,
    isLoadingFFDUsage: false,
  };
};
