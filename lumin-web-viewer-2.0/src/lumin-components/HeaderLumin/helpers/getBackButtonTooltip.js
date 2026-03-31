import { store } from 'src/redux/store';

import selectors from 'selectors';

const { getState } = store;

export default ({ documentLocation, t }) => {
  const currentUser = selectors.getCurrentUser(getState());

  if (!currentUser) {
    return t('authenPage.goToSignIn');
  }

  return `${t('viewer.goToDocumentLocation')} ${documentLocation}`;
};
