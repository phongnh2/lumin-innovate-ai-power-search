import selectors from 'selectors';

import { useTranslation } from 'hooks';
import { useShallowSelector } from 'hooks/useShallowSelector';

import { getToolChecker } from 'helpers/getToolPopper';

const useToolChecker = (toolName, featureName = '') => {
  const currentUser = useShallowSelector(selectors.getCurrentUser);
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);
  const { t } = useTranslation();
  return getToolChecker({
    toolName,
    featureName,
    currentUser,
    currentDocument,
    translator: t,
  });
};

export default useToolChecker;
