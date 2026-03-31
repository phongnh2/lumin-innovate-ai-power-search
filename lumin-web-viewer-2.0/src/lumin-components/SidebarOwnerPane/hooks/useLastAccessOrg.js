import { cloneDeep, uniqBy } from 'lodash';

import lastAccessOrgs from 'utils/lastAccessOrgs';

const useLastAccessOrg = (organizationList) => {
  if (organizationList.length === 0) {
    return [];
  }

  const orgUrlList = lastAccessOrgs.getOrgUrlList();
  const newOrganizationList = cloneDeep(organizationList);
  const lastAccessOrgList = orgUrlList.map((orgUrl) =>
    organizationList.find((item) => item.organization.url === orgUrl)
  );
  const filteredAccessOrgs = lastAccessOrgList.filter(Boolean);
  const newOrgUrls = filteredAccessOrgs.map((item) => ({ id: item.organization._id, url: item.organization.url }));
  lastAccessOrgs.setOrgUrlsToStorage(newOrgUrls);
  return uniqBy([...filteredAccessOrgs, ...newOrganizationList], (item) => item.organization.url);
};

export default useLastAccessOrg;
