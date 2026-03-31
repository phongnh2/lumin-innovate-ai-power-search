import { camelCase, sampleSize } from 'lodash';
import { useEffect, useState } from 'react';

const DISMISS_REASON_LIST = [
  'I need to try it first',
  'Product is low quality',
  'Missing features',
  'Difficult to use',
  'Too expensive',
  "I don't use it enough",
];

const MAX_LENGTH_LIST = 5;

const useGetDismissReasonList = () => {
  const [list, setList] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    const sampledList = sampleSize(DISMISS_REASON_LIST, MAX_LENGTH_LIST);
    const _list = [...sampledList, 'Other'].map((item) => ({ value: camelCase(item), label: item }));

    setList(_list);
  }, []);

  return list;
};

export default useGetDismissReasonList;
