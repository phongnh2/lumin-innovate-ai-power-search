/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/await-thenable */
import { Dispatch } from 'react';

import {
  Destination,
  DestinationLocation,
} from 'luminComponents/TransferDocument/interfaces/TransferDocument.interface';

import { FolderServices } from 'services';

import { RootTypes } from 'features/NestedFolders/constants';

import { FolderType } from 'constants/folderConstant';

import { IFolder } from 'interfaces/folder/folder.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

interface Props {
  organizations: IOrganization[];
  setDestination: Dispatch<Destination>;
  selectedTarget: IOrganization | IUser;
  isPersonalWorkspace?: boolean;
  item: IFolder | ITeam | IOrganization;
  type: DestinationLocation;
  setExpandedItem?: Dispatch<string>;
  setSelectedTarget?: Dispatch<IOrganization | IUser>;
  setPersonalTargetSelected?: Dispatch<boolean>;
  getFolders?: (params: { type: string; source?: string; personalOnly?: boolean }) => any;
  getNestedFolders?: (payload: { rootType: RootTypes; orgId?: string; teamId?: string }) => Promise<void>;
}

export const goToDestination = async ({
  organizations,
  setDestination,
  selectedTarget,
  isPersonalWorkspace,
  item,
  type,
  setExpandedItem,
  setSelectedTarget,
  setPersonalTargetSelected,
  getFolders,
  getNestedFolders,
}: Props): Promise<void> => {
  switch (type) {
    case DestinationLocation.FOLDER: {
      let belongsToType;
      let expandItem;
      let parentType;
      const selectedItem = item as IFolder;
      if (!isPersonalWorkspace) {
        if (selectedItem.path.path) {
          belongsToType = DestinationLocation.ORGANIZATION_TEAM;
          const selectedTeam: ITeam = (selectedTarget as IOrganization).teams.find(
            (team: ITeam) => team._id === selectedItem.path._id
          );
          expandItem = selectedTeam._id as string;
          parentType = FolderType.ORGANIZATION_TEAM;
        } else {
          const isBelongsToOrg = selectedItem.path._id === selectedTarget._id;
          belongsToType = isBelongsToOrg ? DestinationLocation.ORGANIZATION : DestinationLocation.PERSONAL;
          expandItem = selectedItem.path._id;
          parentType = isBelongsToOrg ? FolderType.ORGANIZATION : FolderType.PERSONAL;
        }
      } else {
        belongsToType = DestinationLocation.PERSONAL;
        parentType = FolderType.PERSONAL;
        expandItem = selectedItem.path._id;
      }
      setExpandedItem(expandItem);
      getFolders({ type: parentType, source: expandItem, personalOnly: isPersonalWorkspace });
      const folderService = new FolderServices(belongsToType);
      const folder = (await folderService.getDetail(selectedItem._id)) as IFolder;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const rootTypeMapping = {
        [DestinationLocation.PERSONAL]: RootTypes.Personal,
        [DestinationLocation.ORGANIZATION]: RootTypes.Organization,
        [DestinationLocation.ORGANIZATION_TEAM]: RootTypes.Team,
      }[belongsToType];
      await getNestedFolders({ rootType: rootTypeMapping, teamId: folder.belongsTo.location._id }).then(() => {
        setDestination({
          _id: folder._id,
          name: folder.name,
          type: DestinationLocation.FOLDER,
          belongsTo: { ...folder.belongsTo.location, type: belongsToType },
          scrollTo: folder._id,
        });
      });
      break;
    }
    case DestinationLocation.ORGANIZATION_TEAM: {
      const selectedItem = item as ITeam;
      const selectedOrganization = organizations.find((organization) => organization._id === selectedItem.path._id);
      const selectedTeam = selectedOrganization.teams.find((team) => team._id === selectedItem._id);
      setDestination({
        ...selectedTeam,
        type: DestinationLocation.ORGANIZATION_TEAM,
        belongsTo: { ...selectedOrganization, data: selectedOrganization },
        scrollTo: selectedTeam._id,
      });
      break;
    }
    case DestinationLocation.ORGANIZATION: {
      const selectedItem = item as IOrganization;
      const selectedOrganization = organizations.find((organization) => organization._id === selectedItem._id);
      setSelectedTarget(selectedOrganization);
      setDestination({
        _id: selectedOrganization._id,
        name: selectedOrganization.name,
        type: DestinationLocation.ORGANIZATION,
        scrollTo: selectedOrganization._id,
        belongsTo: {
          _id: selectedOrganization._id,
          name: selectedOrganization.name,
          type: DestinationLocation.ORGANIZATION,
          data: selectedOrganization,
        },
      });
      setExpandedItem('');
      setPersonalTargetSelected(false);
      break;
    }

    default:
      break;
  }
};

export const getOwnerId = (destination: Destination, currentUser: IUser): string => {
  if (DestinationLocation.PERSONAL === destination.type) {
    return currentUser._id;
  }
  if (DestinationLocation.ORGANIZATION_TEAM === destination.type) {
    return destination._id;
  }
  return destination.belongsTo._id;
};

export const isOrganizationDocuments = (destination: Destination): boolean => {
  const { type, belongsTo } = destination;
  const isInFolder = type === DestinationLocation.FOLDER;
  const destinationType = isInFolder ? belongsTo.type : type;
  return destinationType === DestinationLocation.ORGANIZATION;
};
