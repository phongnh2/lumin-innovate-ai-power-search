import React from 'react';

import { useHomeEditAPdfFlowHandler } from '../hooks';

const withHomeEditAPdfFlow =
  <T,>(Component: React.ComponentType<ReturnType<typeof useHomeEditAPdfFlowHandler>>) =>
  (props: T & { isOnHomeEditAPdfFlow?: boolean }) => {
    const data = useHomeEditAPdfFlowHandler({ isOnHomeEditAPdfFlow: Boolean(props.isOnHomeEditAPdfFlow) });
    return <Component {...props} {...data} />;
  };

export default withHomeEditAPdfFlow;
