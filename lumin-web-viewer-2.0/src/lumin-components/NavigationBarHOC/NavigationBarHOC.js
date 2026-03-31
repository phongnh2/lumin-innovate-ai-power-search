/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { useLocation } from 'react-router-dom';

import { useViewerMatch } from 'hooks/useViewerMatch';

const nonHeaderPageUrlList = ['/invite-members', '/notFound'];

const NavigationBarHOC = (WrappedComponent) => (props) => {
  const location = useLocation();
  const { isViewer } = useViewerMatch();
  const pathName = location.pathname.replace(/\/$/, '');

  if (nonHeaderPageUrlList.includes(pathName) || isViewer) {
    return null;
  }
  return (<WrappedComponent {...props} />);
};

export default NavigationBarHOC;
