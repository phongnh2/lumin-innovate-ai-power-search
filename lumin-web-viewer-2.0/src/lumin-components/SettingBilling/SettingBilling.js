import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';

import selectors from 'selectors';
import SettingBillingDetail from 'luminComponents/SettingBillingDetail';
import Loading from 'luminComponents/Loading';

function SettingBilling() {
  const { loading } = useSelector(selectors.getOrganizationList, shallowEqual);

  return <div>{loading ? <Loading normal /> : <SettingBillingDetail />}</div>;
}

export default SettingBilling;
