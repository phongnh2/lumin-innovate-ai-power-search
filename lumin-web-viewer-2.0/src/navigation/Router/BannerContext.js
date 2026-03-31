import React from 'react';

export default React.createContext({
  showBannerPersonal: true,
  setShowBanner: (_data) => {},
  showBannerOrg: true,
});
