import React, { useMemo } from 'react';

import { useAutoDetectFormFields } from 'features/FormFieldDetection/hooks/useAutoDetectFormFields';

import { ContentCheckerContext } from '../contexts/ContentChecker.context';
import { useCheckFormFieldIndicatorInContent } from '../hooks/useCheckFormFieldIndicatorInContent';

const ContentCheckerProvider = ({ children }: { children: React.ReactNode }) => {
  const { isContainFormFieldIndicator } = useCheckFormFieldIndicatorInContent();
  useAutoDetectFormFields();

  const contextValue = useMemo(
    () => ({
      isContainFormFieldIndicator,
    }),
    [isContainFormFieldIndicator]
  );

  return <ContentCheckerContext.Provider value={contextValue}>{children}</ContentCheckerContext.Provider>;
};

export default ContentCheckerProvider;
