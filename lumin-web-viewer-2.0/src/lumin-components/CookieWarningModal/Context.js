import React from 'react';

export default React.createContext({
  isVisible: false,
  setCookieModalVisible: (_data) => {},
  cookiesDisabled: false,
});
