import { Dispatch, SetStateAction } from 'react';

import { RootTypes } from 'features/NestedFolders/constants';
import { NestedFolderData } from 'features/NestedFolders/types';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

export enum DestinationLocation {
  FOLDER = 'FOLDER',
  ORGANIZATION = 'ORGANIZATION',
  PERSONAL = 'PERSONAL',
  ORGANIZATION_TEAM = 'ORGANIZATION_TEAM',
}

export type ParentLocation = {
  name?: string;
  type?: DestinationLocation;
};

export type SetDestinationParams = {
  setDestination?: Dispatch<Destination>;
  item: ITeam | IOrganization | IUser | IFolder;
  type: DestinationLocation;
  belongsTo?: DestinationBelongsTo;
};

export type DestinationBelongsTo = {
  _id?: string;
  type?: DestinationLocation;
  name?: string;
  data?: IOrganization | ITeam | IUser;
};

export type Destination = {
  _id: string;
  name: string;
  type: DestinationLocation;
  belongsTo: DestinationBelongsTo;
  scrollTo?: string;
};

export type PersonalData = {
  _id: string;
  isOldProfessional: boolean;
  originUser: IUser;
};

export type FolderData = {
  folders: IFolder[];
  isLoading: boolean;
};

export enum ModalContext {
  MOVE = 'MOVE',
  COPY = 'COPY',
}

export type TotalFolder = {
  [key: string]: {
    myDocuments: number;
    orgDocuments: number;
    teams: Record<string, number>;
  };
};

export type ITransferDocumentContext = {
  getter: {
    personalData: PersonalData;
    destination: Destination;
    selectedTarget: IOrganization | IUser;
    getTeamsOfSelectedOrg: () => ITeam[];
    organizations: IOrganization[];
    disableTarget: string;
    folderData: FolderData;
    nestedFolderData: NestedFolderData;
    getFolders: (params: { type: string; source?: string; personalOnly?: boolean }) => any;
    error: string | JSX.Element;
    documents: IDocumentBase[];
    expandedItem: string;
    isProcessing: boolean;
    context: {
      title: string;
      selectAPlace: string;
      submit: string;
      showAllLocation: boolean;
      action: string;
      isCopyModal: boolean;
    };
    isDocumentNameOpen: boolean;
    newDocumentName: string;
    errorName: string;
    isShowNotify: boolean;
    isNotify: boolean;
    isPersonalTargetSelected: boolean;
    totalFolders: TotalFolder;
    loading: boolean;
  };
  setter: {
    setDestination: Dispatch<Destination>;
    setSelectedTarget: Dispatch<IOrganization | IUser>;
    onClose: () => void;
    setExpandedItem: Dispatch<string>;
    setNewDocumentName: Dispatch<string>;
    setErrorName: Dispatch<string>;
    resetFolders: () => void;
    setIsNotify: Dispatch<SetStateAction<boolean>>;
    setPersonalTargetSelected: Dispatch<boolean>;
    setLoading: Dispatch<boolean>;
    getNestedFolders: (payload: {
      rootType: RootTypes;
      orgId?: string;
      teamId?: string;
      withLoading?: boolean;
      forcePersonalTarget?: boolean;
    }) => Promise<void>;
  };
  onSubmit: ({ target }: { target: IOrganization | IUser }) => Promise<void> | void;
};

export type ISearchResults = {
  orgResults: IOrganization[];
  teamResults: ITeam[];
  folderResults: IFolder[];
};
