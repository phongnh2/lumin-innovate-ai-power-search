import { isNil } from 'lodash';
import { useState } from 'react';
import { useSelector } from 'react-redux';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import { getLanguage } from 'utils/getLanguage';

const MAX_SPLIT_FILES = 10000;

export const useSplitByPageHandler = () => {
  const { t } = useTranslation();
  const [pageNumberPerFile, setPageNumberPerFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const totalPages = useSelector(selectors.getTotalPages);

  const onChange = (value: string): void => {
    const numericAndCommaDashRegex = /^[\d\s]*$/;
    const isValidInput = (input: string): boolean => numericAndCommaDashRegex.test(input);
    if (!isValidInput(value)) {
      return;
    }
    setPageNumberPerFile(value);
    setError(null);
  };

  const onBlur = (value: string): void => {
    if (!value) {
      setError(t('errorMessage.invalidPagePosition'));
      return;
    }

    if (Number(value) > totalPages) {
      setError(t('viewer.pageTools.pageNumberExceedTotalPage'));
      return;
    }

    const numberOfFiles = Math.ceil(totalPages / Number(value));
    if (numberOfFiles > MAX_SPLIT_FILES) {
      setError(
        t('viewer.pageTools.pagePerFileTooLarge', {
          maxSplitFiles: new Intl.NumberFormat(getLanguage()).format(MAX_SPLIT_FILES),
        })
      );
    }
  };

  return {
    pageNumberPerFile,
    onChange,
    onBlur,
    error,
    isValid: !isNil(pageNumberPerFile) && Number(pageNumberPerFile) > 0 && Number(pageNumberPerFile) <= totalPages,
  };
};
