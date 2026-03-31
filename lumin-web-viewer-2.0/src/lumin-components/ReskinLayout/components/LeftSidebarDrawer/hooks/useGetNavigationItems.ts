import { useMemo } from 'react';

import {
  useGetCurrentOrganization,
  useTranslation,
  usePremiumUserRouteMatch,
  usePersonalWorkspaceLocation,
} from 'hooks';
import { useGetCurrentUser } from 'hooks/useGetCurrentUser';
import useOrganizationRouteMatch from 'hooks/useOrganizationRouteMatch';

import organizationServices from 'services/organizationServices';

import { NavigationNames } from 'utils/Factory/EventCollection/constants/NavigationEvent';

import { useEnableAITool } from 'features/AgreementGen/hooks';

import { AWS_EVENTS } from 'constants/awsEvents';
import { ORG_TEXT } from 'constants/organizationConstants';
import { STATIC_PAGE_URL } from 'constants/urls';

import { NavigationTypes, SubMenuTypes } from '../LeftSidebarDrawer.constants';
import { NavigationItems, LinkProps, SubMenuProps } from '../LeftSidebarDrawer.types';

const useGetNavigationItems = (): NavigationItems[] => {
  const { t } = useTranslation();
  const currentUser = useGetCurrentUser();
  const currentOrganization = useGetCurrentOrganization();
  const { orgRouteMatch } = useOrganizationRouteMatch();
  const { isPremiumUserRoute } = usePremiumUserRouteMatch();
  const isAtPersonalWorkspace = usePersonalWorkspaceLocation();

  const { enabled: enabledAITool } = useEnableAITool();

  return useMemo(() => {
    if (!currentUser?._id) {
      return [];
    }

    const hasCurrentOrg = Boolean(currentOrganization?._id);
    const isManager = orgRouteMatch && organizationServices.isManager(currentOrganization?.userRole);
    const baseUrl = orgRouteMatch ? `/${ORG_TEXT}/${currentOrganization?.url}` : '';

    return [
      {
        id: 'home_link_button_drawer',
        name: NavigationNames.HOME,
        title: t('common.home'),
        icon: 'smart-home-lg',
        type: NavigationTypes.Link,
        eventType: AWS_EVENTS.NAVIGATION,
        show: isPremiumUserRoute ? false : hasCurrentOrg,
        extraProps: { url: `${baseUrl}/home` } as LinkProps,
      },
      {
        id: 'documents_link_button_drawer',
        name: NavigationNames.DOCS,
        title: t('common.documents'),
        icon: 'file-type-pdf-lg',
        show: true,
        type: NavigationTypes.SubMenu,
        eventType: AWS_EVENTS.NAVIGATION,
        extraProps: { type: SubMenuTypes.Documents } as SubMenuProps,
      },
      {
        id: 'lumin_templates_link_button_drawer',
        name: NavigationNames.TEMPLATES,
        title: t('common.templates'),
        icon: 'logo-template-lg',
        show: true,
        newFeatureBadge: true,
        type: NavigationTypes.Link,
        ...(isAtPersonalWorkspace
          ? {
              eventType: AWS_EVENTS.NAVIGATION,
              extraProps: { url: `${STATIC_PAGE_URL}/form-templates`, openInNewTab: true } as LinkProps,
            }
          : {
              type: NavigationTypes.SubMenu,
              extraProps: { type: SubMenuTypes.Templates } as SubMenuProps,
            }),
      },
      {
        id: 'agreement_gen_link_button_drawer',
        name: NavigationNames.AGREEMENT_GEN,
        title: t('common.generate'),
        icon: 'lm-agreement-gen',
        show: enabledAITool && !isAtPersonalWorkspace,
        type: NavigationTypes.SubMenu,
        eventType: AWS_EVENTS.NAVIGATION,
        extraProps: { type: SubMenuTypes.AgreementGen } as SubMenuProps,
      },
      {
        id: 'lumin_sign_link_button_drawer',
        name: NavigationNames.CONTRACTS,
        title: t('action.sign'),
        icon: 'logo-sign-lg',
        show: !isAtPersonalWorkspace,
        type: NavigationTypes.SubMenu,
        eventType: AWS_EVENTS.NAVIGATION,
        extraProps: { type: SubMenuTypes.Signs } as SubMenuProps,
      },
      {
        id: 'settings_button_drawer',
        name: NavigationNames.SETTINGS,
        title: t('common.settings'),
        icon: 'settings-lg',
        show: isManager,
        type: NavigationTypes.SubMenu,
        eventType: AWS_EVENTS.NAVIGATION,
        extraProps: { type: SubMenuTypes.Settings } as SubMenuProps,
      },
    ] as NavigationItems[];
  }, [currentOrganization, currentUser, isPremiumUserRoute, enabledAITool, isAtPersonalWorkspace]);
};

export default useGetNavigationItems;
