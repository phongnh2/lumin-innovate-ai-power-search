import { useContext } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import actions from 'actions';
import selectors from 'selectors';

import { MyDocumentGuideContext } from 'HOC/withMyDocumentGuide/MyDocumentGuideContext';

import { organizationServices } from 'services';

import logger from 'helpers/logger';

import { ORG_TEXT } from 'constants/organizationConstants';

import { IOrganizationData } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

const useContentMigrateModal = (): {
  titleKey?: string;
  onClose?: (data: { action: string }) => void;
  descriptionKey?: string;
  itemsKey?: string[];
  notifyMigratedKey?: string;
  linkTo?: string;
} => {
  const { closeMyDocumentGuide } = useContext(MyDocumentGuideContext) as { closeMyDocumentGuide: () => unknown };
  const { data: currentOrganization } = useSelector<unknown, IOrganizationData>(
    selectors.getCurrentOrganization,
    shallowEqual
  );
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const { migratedOrgUrl } = currentUser;
  const dispatch = useDispatch();

  if (!currentOrganization) {
    return null;
  }
  const handleOnClose = async (data: { action: string }): Promise<void> => {
    const { action } = data;
    if (action === 'reset') {
      try {
        await organizationServices.hideInformMyDocumentModal(currentOrganization._id);
        dispatch(actions.updateCurrentUser({
            ...(migratedOrgUrl === currentOrganization.url
              ? { migratedOrgUrl: null }
              : { metadata: { hasInformedMyDocumentUpload: true } }),
          })
        );
        closeMyDocumentGuide();
      } catch (err) {
        logger.logError({ error: err });
      }
    }
  };
  if (migratedOrgUrl === currentOrganization.url) {
    return {
      titleKey: 'informDocumentGuide.migratedModal.title',
      descriptionKey: 'informDocumentGuide.migratedModal.description',
      onClose: handleOnClose,
    };
  }
  return {
    titleKey: 'informDocumentGuide.uploadDocument.title',
    itemsKey: [
      'informDocumentGuide.uploadDocument.warningWorkspace',
      'informDocumentGuide.uploadDocument.warningUpload',
    ],
    ...(migratedOrgUrl && {
      notifyMigratedKey: 'informDocumentGuide.uploadDocument.notifyMigrated',
      linkTo: `/${ORG_TEXT}/${migratedOrgUrl}/documents/personal`,
    }),
    onClose: handleOnClose,
  };
};

export default useContentMigrateModal;
