import classNames from 'classnames';
import { Text } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import {
  Routes,
  Route,
  NavLink,
  Navigate,
  useResolvedPath,
} from 'react-router-dom';

import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import CustomHeader from 'luminComponents/CustomHeader';
import OrganizationDashboardAppCover from 'luminComponents/OrganizationDashboardAppCover';

import { useTabletMatch, useDesktopMatch, useTranslation, useEnableWebReskin } from 'hooks';

import DeveloperApi from 'features/DeveloperApi';

import {
  OrganizationInsights,
  OrganizationPeople,
  OrganizationBilling,
  OrganizationSecurity,
  OrganizationSettings,
} from './components';

import './OrganizationDashboard.scss';

const getRoutes = (t) => [
  {
    id: '1',
    name: t('common.insights'),
    url: '',
    component: OrganizationInsights,
  },
  {
    id: '2',
    name: t('common.people'),
    url: 'people',
    component: OrganizationPeople,
  },
  {
    id: '3',
    name: t('common.billing'),
    url: 'billing',
    component: OrganizationBilling,
  },
  {
    id: '4',
    name: t('common.security'),
    url: 'security',
    component: OrganizationSecurity,
  },
  {
    id: '5',
    name: t('common.settings'),
    url: 'settings',
    component: OrganizationSettings,
  },
  {
    id: '6',
    name: t('developerApi.title'),
    url: 'developer-settings',
    component: DeveloperApi,
  },
];

const propTypes = {
  currentOrganization: PropTypes.object.isRequired,
};

const defaultProps = {
};

const OrganizationDashboard = ({ currentOrganization }) => {
  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();
  const [rightElement, setRightElement] = useState(null);
  const { data, loading } = currentOrganization;
  const url = useResolvedPath("").pathname;
  const isTablet = useTabletMatch();
  const isDesktopMatch = useDesktopMatch();
  const routes = getRoutes(t);

  const mapRoute = (item) => {
    const Component = item.component;
    return (
      <Route
        key={item.id}
        path={item.url}
        element={
          <>
            <CustomHeader
              metaTitle={item?.metaTitle}
              description={item?.metaDescription}
              title={item?.metaTitle}/>
            <Component setRightElement={setRightElement} />
          </>
        }
      />
    );
  };

  if (loading) {
    return null;
  }

  const { name, domain } = data;
  const orgName = name || domain;

  return (
    <>
      <PageTitlePortal.Element>
        {!isEnableReskin && isDesktopMatch ? (
          <h1 className="OrganizationDashboard__pageTitleHeader">
            {t('orgDashboardInsight.orgDashboard', { orgName })}
          </h1>
        ) : (
          <Text component="h1" size="md" type="headline" color="var(--kiwi-colors-surface-on-surface)">
            {t('orgDashboardInsight.orgSettings')}
          </Text>
        )}
      </PageTitlePortal.Element>
      {!isTablet && !isEnableReskin && <OrganizationDashboardAppCover currentOrganization={currentOrganization} />}
      <div
        className={
          isEnableReskin
            ? classNames('OrganizationDashboard__wrapper--reskin', {
                'OrganizationDashboard__wrapper--fit-content': currentOrganization?.data?.isRestrictedBillingActions,
              })
            : 'OrganizationDashboard__wrapper'
        }
      >
        {!isEnableReskin && (
          <div className="OrganizationDashboard__top">
            <h2 className="OrganizationDashboard__pageTitle">{t('orgDashboardInsight.orgDashboard', { orgName })}</h2>
            <div className="OrganizationDashboard__navContainer">
              <ul className="OrganizationDashboard__nav">
                {routes.map((item) => (
                  <li key={item.id} className="OrganizationDashboard__navItem">
                    <NavLink
                      to={item.url ? `${url}/${item.url}` : url}
                      className={({ isActive }) =>
                        isActive
                          ? 'OrganizationDashboard__navItemLink OrganizationDashboard__navItemLink--active'
                          : 'OrganizationDashboard__navItemLink'
                      }
                      end
                    >
                      {item.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
              {rightElement}
            </div>
          </div>
        )}
        <div className="OrganizationDashboard__bottom">
          <Routes>
            {routes.map((item) => mapRoute(item))}
            <Route element={<Navigate to="/not-found" />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

OrganizationDashboard.propTypes = propTypes;
OrganizationDashboard.defaultProps = defaultProps;

export default OrganizationDashboard;
