import { get } from 'lodash';

import selectors from 'selectors';
import { store } from 'store';

import { commonUtils } from 'utils';
import { getLanguageAttr } from 'utils/getCommonAttributes';

export async function getMetadataLangfuse() {
  const currentUser = selectors.getCurrentUser(store.getState());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const { LuminLanguage, browserLanguage } = (await getLanguageAttr()) as {
    LuminLanguage: string;
    browserLanguage: string;
  };
  const email = get(currentUser, 'email', '');
  const emailDomain = commonUtils.getDomainFromEmail(email);
  return {
    luminLanguage: LuminLanguage,
    browserLanguage,
    emailDomain,
  };
}
