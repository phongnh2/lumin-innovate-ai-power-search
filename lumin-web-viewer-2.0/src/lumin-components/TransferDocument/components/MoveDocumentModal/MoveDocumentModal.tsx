import React, { useState, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import TransferDocument from 'lumin-components/TransferDocument';
import { getOwnerId } from 'luminComponents/TransferDocument/helpers/destinationHelper';
import { useMoveDocuments } from 'luminComponents/TransferDocument/hooks/useMoveDocuments';
import { Destination, ModalContext } from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { DOCUMENT_TYPE } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { OrganizationList } from 'interfaces/redux/organization.redux.interface';
import { IUser } from 'interfaces/user/user.interface';

import MoveDocumentConfirmModal from '../MoveDocumentConfirmModal';

type MoveDocumentProps = {
  documents: IDocumentBase[];
  onClose: () => void;
};

function MoveDocumentModal({ documents, onClose }: MoveDocumentProps): JSX.Element {
  const organizationList = useSelector<unknown, OrganizationList>(selectors.getOrganizationList, shallowEqual).data;
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);

  const [destination, setDestination] = useState<Destination>({} as Destination);
  const [openConfirmModal, setOpenConfirmModal] = useState<{ isOpen: boolean; target?: IOrganization | IUser }>({
    isOpen: false,
    target: null,
  });
  const [isMoving, setIsMoving] = useState(false);
  const [error, setError] = useState<string | JSX.Element>('');

  const getData = (): {
    organizations: IOrganization[];
    disableTarget: string;
  } => {
    const {
      belongsTo: { type, location, workspaceId },
      folderId,
    } = documents[0];

    switch (type) {
      case DOCUMENT_TYPE.PERSONAL: {
        const orgList: IOrganization[] = workspaceId
          ? [organizationList.find(({ organization }) => organization._id === workspaceId).organization]
          : organizationList.map(({ organization }) => organization);
        return {
          organizations: orgList,
          disableTarget: folderId || currentUser._id,
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION: {
        const ownedOrg: IOrganization = organizationList.find(
          ({ organization }) => organization._id === location._id
        ).organization;
        return {
          organizations: [ownedOrg],
          disableTarget: folderId || location._id,
        };
      }
      case DOCUMENT_TYPE.ORGANIZATION_TEAM: {
        const ownedOrg: IOrganization = organizationList.find(({ organization }) =>
          organization.teams.find((team) => team._id === location._id)
        ).organization;
        return {
          organizations: [ownedOrg],
          disableTarget: folderId || location._id,
        };
      }
      default:
        break;
    }
  };

  const { organizations, disableTarget } = getData();

  const [selectedTarget, setSelectedTarget] = useState<IOrganization | IUser>(organizations[0] || currentUser);

  const { moveDocuments } = useMoveDocuments({
    destination,
    setOpenConfirmModal,
    setError,
    selectedTarget: organizations.find((org) => org._id === selectedTarget._id),
  });

  const handleMoveDocuments = useCallback(
    async ({ isNotify }: { isNotify?: boolean } = { isNotify: false }): Promise<void> => {
      setIsMoving(true);

      await moveDocuments({
        documents,
        isNotify,
        onClose,
        setIsMoving,
      });
    },
    [moveDocuments, documents, onClose]
  );

  const onSubmit = ({
    target,
  }: {
    target: IOrganization | IUser;
  }): Promise<void> => {
    const ownerId = documents[0].clientId || currentUser._id;
    if (ownerId === getOwnerId(destination, currentUser)) {
      return handleMoveDocuments();
    }

    setOpenConfirmModal({ isOpen: true, target });
  };

  return (
    <>
      <TransferDocument
        documents={documents}
        organizations={organizations}
        disableTarget={disableTarget}
        onClose={onClose}
        error={error}
        onSubmit={onSubmit}
        destination={destination}
        setDestination={setDestination}
        isProcessing={isMoving}
        context={ModalContext.MOVE}
        selectedTarget={selectedTarget}
        setSelectedTarget={setSelectedTarget}
      />
      {openConfirmModal.isOpen && (
        <MoveDocumentConfirmModal
          visible
          onClose={() => {
            setOpenConfirmModal({ isOpen: false, target: null });
          }}
          isMoving={isMoving}
          handleMoveDocuments={handleMoveDocuments}
          documents={documents}
          destination={destination}
          selectedTarget={openConfirmModal.target}
        />
      )}
    </>
  );
}

export default MoveDocumentModal;
