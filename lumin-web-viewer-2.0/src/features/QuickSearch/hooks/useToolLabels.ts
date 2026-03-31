import { useSelector } from 'react-redux';

import { useTranslation } from 'hooks/useTranslation';

import { quickSearchSelectors } from 'features/QuickSearch/slices';

interface ToolLabels {
  getToolLabel: (regularLabel: string, quickSearchLabel: string) => string;
}

export const useToolLabels = (): ToolLabels => {
  const { t } = useTranslation();
  const isInQuickSearch = useSelector(quickSearchSelectors.isOpenQuickSearch);

  const getToolLabel = (regularLabel: string, quickSearchLabel: string): string =>
    isInQuickSearch ? t(quickSearchLabel) : t(regularLabel);

  return {
    getToolLabel,
  };
};
