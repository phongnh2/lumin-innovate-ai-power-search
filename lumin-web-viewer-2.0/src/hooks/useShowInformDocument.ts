import { useContext } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';
import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';
import { MyDocumentGuideContext } from 'HOC/withMyDocumentGuide/MyDocumentGuideContext';

const useShowInformDocument = (): boolean => {
  const { showMyDocumentGuide } = useContext(MyDocumentGuideContext) as { showMyDocumentGuide: boolean };
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { data: currentOrganization, loading } = useSelector<unknown, IOrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  if (loading || !currentOrganization) {
    return false;
  }
  const {
    migratedOrgUrl,
    metadata: { hasInformedMyDocumentUpload },
  } = currentUser;
  return (
    showMyDocumentGuide &&
    (currentOrganization.url === migratedOrgUrl || !hasInformedMyDocumentUpload)
  );
};

export default useShowInformDocument;
