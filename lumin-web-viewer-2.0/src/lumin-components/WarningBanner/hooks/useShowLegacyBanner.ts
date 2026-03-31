import { useEffect, useState } from 'react';

import { WarningBannerType } from 'constants/banner';
import { LocalStorageKey } from 'constants/localStorageKey';

import { IOrganization } from 'interfaces/organization/organization.interface';

import useWarningBannerController from './useWarningBannerController';

const useShowLegacyBanner = ({ currentOrganization }: { currentOrganization: IOrganization }) => {
  const controller = useWarningBannerController();
  const [showLegacyCustomerMigration, setShowLegacyCustomerMigration] = useState(false);

  useEffect(() => {
    if (!currentOrganization?._id) {
      return;
    }
    const closedOrgs = JSON.parse(
      localStorage.getItem(LocalStorageKey.HAS_CLOSED_LEGACY_CUSTOMER_MIGRATION_BANNER) || '[]'
    ) as string[];
    setShowLegacyCustomerMigration(!closedOrgs.includes(currentOrganization._id));
  }, [currentOrganization?._id]);

  const handleCloseLegacyCustomerMigrationBanner = () => {
    if (!currentOrganization?._id) {
      return;
    }

    setShowLegacyCustomerMigration(false);
    controller.setBannerClosed(WarningBannerType.LEGACY_CUSTOMER_MIGRATION.value);
    const closedOrgs = JSON.parse(
      localStorage.getItem(LocalStorageKey.HAS_CLOSED_LEGACY_CUSTOMER_MIGRATION_BANNER) || '[]'
    ) as string[];

    if (!closedOrgs.includes(currentOrganization._id)) {
      closedOrgs.push(currentOrganization._id);
      localStorage.setItem(LocalStorageKey.HAS_CLOSED_LEGACY_CUSTOMER_MIGRATION_BANNER, JSON.stringify(closedOrgs));
    }
  };

  return {
    showLegacyCustomerMigration,
    handleCloseLegacyCustomerMigrationBanner,
  };
};

export default useShowLegacyBanner;
