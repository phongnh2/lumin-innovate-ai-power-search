import { get } from 'lodash';

import selectors from 'selectors';

import useShallowSelector from 'hooks/useShallowSelector';

import { Plans } from 'constants/plan';

/**
 * Enhanced features are AI document summary, document version history
 */
export function useGetEnhancedFeaturesPlan() {
  const currentDocument = useShallowSelector(selectors.getCurrentDocument);

  if (!currentDocument) {
    return false;
  }

  const currentPlan = get(currentDocument, 'documentReference.data.payment.type', '');

  return [Plans.ORG_PRO, Plans.ORG_BUSINESS].includes(currentPlan);
}
