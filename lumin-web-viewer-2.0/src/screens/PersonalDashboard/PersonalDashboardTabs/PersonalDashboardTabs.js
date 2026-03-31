import React from 'react';

import Icomoon from 'luminComponents/Icomoon';
import Tabs from 'luminComponents/Shared/Tabs';

import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import * as Styled from './PersonalDashboardTabs.styled';

const TABS = [
  {
    value: 'insights',
    label: 'Insights',
    icon: <Icomoon className="insights" size={24} />,
    to: '/dashboard/insights',
  },
  {
    value: 'activities',
    label: 'Activities',
    icon: <Icomoon className="activities" size={24} />,
    to: '/dashboard/activities',
    buttonName: ButtonName.PERSONAL_ACTIVITIES_DASHBOARD_SWITCH,
    buttonPurpose: ButtonPurpose[ButtonName.PERSONAL_ACTIVITIES_DASHBOARD_SWITCH],
  },
];

const PersonalDashboardTabs = () => (
  <Styled.Container>
    <Tabs tabs={TABS} isLink />
  </Styled.Container>
);

export default PersonalDashboardTabs;
