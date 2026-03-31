import { sampleSize } from 'lodash';
import { useEffect, useState } from 'react';

import { useTranslation } from 'hooks';

const CANCEL_REASON_LIST = [
  'itsTooExpensive',
  'iNeedMoreFeatures',
  'iFoundAnAlternative',
  'iNoLongerNeedIt',
  'customerServiceWasLessThanExpected',
  'easeOfUseWasLessThanExpected',
  'qualityWasLessThanExpected',
];

const OTHER_REASON = 'otherReason';

const MAX_LENGTH_LIST = 5;

const useGetCancelReasonList = () => {
  const { t } = useTranslation();
  const [list, setList] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const sampledList = sampleSize(CANCEL_REASON_LIST, MAX_LENGTH_LIST);
    const _list = [...sampledList, OTHER_REASON].map((item) => ({
      value: item,
      label: t(`surveySubscription.${item}`),
    }));

    setList(_list);
  }, []);

  return list;
};

export default useGetCancelReasonList;
