import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { MyDocumentGuideContext } from './MyDocumentGuideContext';

const withMyDocumentGuide = (Component: React.ElementType) => (props: Record<string, unknown>) => {
  const [showMyDocumentGuide, setShowDocumentGuide] = useState<boolean>(true);
  const { orgName: orgUrl } = useParams();
  const contextValue = useMemo(
    () => ({
      showMyDocumentGuide,
      closeMyDocumentGuide: () => setShowDocumentGuide(false),
    }),
    [showMyDocumentGuide, setShowDocumentGuide]
  );
  useEffect(() => {
    setShowDocumentGuide(true);
  }, [orgUrl]);

  return (
    <MyDocumentGuideContext.Provider value={contextValue}>
      <Component {...props} />
    </MyDocumentGuideContext.Provider>
  );
};

export default withMyDocumentGuide;
