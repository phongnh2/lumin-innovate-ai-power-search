import selectors from 'selectors';

import { TOOLS_NAME } from 'constants/toolsName';

import useShallowSelector from './useShallowSelector';

export const useInRedactionMode = () => {
  const activeToolName = useShallowSelector(selectors.getActiveToolName);

  return {
    isInRedactionMode: activeToolName === TOOLS_NAME.REDACTION,
  };
};
