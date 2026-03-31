import { AnyAction, Store } from 'redux';

import actions from 'actions';

import warnDeprecatedAPI from 'helpers/warnDeprecatedAPI';

export default (store: Store): void => {
  warnDeprecatedAPI('enableAllElements', 'enableElements([referenceToDisabledDataElements])', '7.0');
  store.dispatch(actions.enableAllElements() as AnyAction);
};
