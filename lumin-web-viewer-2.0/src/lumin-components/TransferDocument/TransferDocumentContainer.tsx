/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { isEmpty } from 'lodash';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import { useEnableNestedFolder } from 'hooks/useEnableNestedFolder';

import FolderServices from 'services/folderServices';
import { getFoldersAvailability } from 'services/graphServices/folder';
import organizationServices from 'services/organizationServices';

import logger from 'helpers/logger';

import { RootTypes } from 'features/NestedFolders/constants';
import { NestedFolderData } from 'features/NestedFolders/types';

import { FolderType } from 'constants/folderConstant';
import { LOGGER } from 'constants/lumin-common';
import { Plans } from 'constants/plan';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IFolder } from 'interfaces/folder/folder.interface';
import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';
import { IUser } from 'interfaces/user/user.interface';

import { TransferDocumentContext } from './context';
import { isOrganizationDocuments } from './helpers/destinationHelper';
import {
  Destination,
  DestinationLocation,
  FolderData,
  ModalContext,
  TotalFolder,
} from './interfaces/TransferDocument.interface';
import TransferDocument from './TransferDocument';

type TransferDocumentProps = {
  documents: IDocumentBase[];
  organizations: IOrganization[];
  onClose: () => void;
  disableTarget?: string;
  onSubmit: ({ target }: { target: IOrganization | IUser }) => Promise<void> | void;
  error?: string | JSX.Element;
  destination: Destination;
  setDestination: (arg: any) => void;
  isProcessing: boolean;
  context: ModalContext;
  newNameState?: {
    isOpen: boolean;
    value: string;
    dispatch: (arg: string) => void;
    error: string;
    setError: (arg: string) => void;
  };
  defaultTarget?: IOrganization | IUser;
  notify?: {
    value: boolean;
    set: (arg: boolean) => void;
  };
  selectedTarget: IOrganization | IUser;
  setSelectedTarget: React.Dispatch<React.SetStateAction<IUser | IOrganization>>;
};

const ModalContent = {
  [ModalContext.MOVE]: {
    title: 'modalMove.moveDocuments',
    selectAPlace: 'modalMove.selectAPlace',
    submit: 'modalMove.move',
    showAllLocation: false,
    action: 'modalMove.moveDocumentTo',
    isCopyModal: false,
  },
  [ModalContext.COPY]: {
    title: 'modalMakeACopy.copyDocuments',
    selectAPlace: 'modalMakeACopy.selectAPlace',
    submit: 'modalMakeACopy.copy',
    showAllLocation: true,
    action: 'modalMakeACopy.copyDocument',
    isCopyModal: true,
  },
};

const initialFolderData = { isLoading: true, folders: [] } as FolderData;

const initialNestedFolderData = {
  personal: [],
  organization: [],
  team: [],
} as NestedFolderData;

type GetTotalFoldersParams = {
  type: string;
  orgId?: string;
  teamId?: string;
  userId?: string;
};

function TransferDocumentContainer({
  documents,
  organizations,
  onClose,
  disableTarget,
  error,
  destination,
  setDestination,
  onSubmit,
  isProcessing,
  context,
  newNameState,
  notify,
  selectedTarget,
  setSelectedTarget,
}: TransferDocumentProps): JSX.Element {
  const [folderData, setFolderData] = useState<FolderData>(initialFolderData);
  const [nestedFolderData, setNestedFolderData] = useState<NestedFolderData>(initialNestedFolderData);
  const [expandedItem, setExpandedItem] = useState('');
  const currentUser = useSelector<unknown, IUser>(selectors.getCurrentUser, shallowEqual);
  const [isPersonalTargetSelected, setPersonalTargetSelected] = useState(selectedTarget._id === currentUser._id);
  const [totalFolders, setTotalFolders] = useState<TotalFolder | any>({});
  const [loading, setLoading] = useState(false);
  const [isShowNotify, setShowNotify] = useState(isOrganizationDocuments(destination));

  const getTeamsOfSelectedOrg = useCallback(
    (): ITeam[] => (selectedTarget as IOrganization).teams || [],
    [selectedTarget]
  );

  const { isEnableNestedFolder } = useEnableNestedFolder();

  const getNestedFolders = useCallback(
    async ({
      rootType,
      orgId,
      teamId,
      withLoading = false,
      forcePersonalTarget = false,
    }: {
      rootType: RootTypes;
      orgId?: string;
      teamId?: string;
      withLoading?: boolean;
      forcePersonalTarget?: boolean;
    }) => {
      if (!isEnableNestedFolder) {
        return;
      }
      if (withLoading) {
        setLoading(true);
      }

      const targetId = orgId || selectedTarget._id;
      switch (rootType) {
        case RootTypes.Personal: {
          const results = await (forcePersonalTarget || isPersonalTargetSelected
            ? organizationServices.getPersonalFolderTree()
            : organizationServices.getPersonalFolderTreeInOrg(targetId));
          setNestedFolderData((prevState) => ({
            ...prevState,
            personal: results.children,
          }));
          break;
        }
        case RootTypes.Organization: {
          const results = await organizationServices.getOrganizationFolderTree(targetId);
          setNestedFolderData((prevState) => ({
            ...prevState,
            organization: results.children,
          }));
          break;
        }
        case RootTypes.Team: {
          if (!teamId) {
            break;
          }
          const results = await organizationServices.getOrganizationTeamsFolderTree({
            orgId: targetId,
            teamIds: [teamId],
          });
          if (!results.teams.length) {
            break;
          }
          setNestedFolderData((prevState) => ({
            ...prevState,
            team: prevState.team.find((team) => team._id === results.teams[0]._id)
              ? prevState.team
              : [...prevState.team, results.teams[0]],
          }));
          break;
        }
        default:
          break;
      }

      if (withLoading) {
        setLoading(false);
      }
    },
    [isPersonalTargetSelected, selectedTarget._id]
  );

  const getFolders = useCallback(
    async ({
      type,
      source,
      personalOnly,
    }: {
      type: string;
      source?: string;
      personalOnly?: boolean;
    }): Promise<IFolder[]> => {
      if (isEnableNestedFolder) {
        setFolderData({ isLoading: false, folders: [] });
        return;
      }
      setFolderData({ isLoading: true, folders: [] });
      const queryParams: { orgId?: string; teamId?: string } = {};
      const folderService = new FolderServices(type);
      switch (type) {
        case FolderType.PERSONAL:
          if (!personalOnly) {
            queryParams.orgId = selectedTarget._id;
          }
          break;
        case FolderType.ORGANIZATION:
          queryParams.orgId = source;
          break;
        case FolderType.ORGANIZATION_TEAM:
          queryParams.teamId = source;
          break;
        default:
          break;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const folderList: IFolder[] = await folderService.getAll(queryParams);
      const folders: IFolder[] = folderList.map((folder) => ({
        _id: folder._id,
        name: folder.name,
        belongsTo: folder.belongsTo,
        listUserStar: folder.listUserStar,
      }));
      setFolderData({ isLoading: false, folders });
      return folders;
    },
    []
  );

  const getTotalFolders = async ({ type, orgId, teamId, userId }: GetTotalFoldersParams): Promise<number> => {
    const folderService = new FolderServices(type);
    return folderService.getTotal({ orgId, teamId, userId }) as Promise<number>;
  };

  const setTotal = async (): Promise<void> => {
    setLoading(true);
    const { _id: orgId } = selectedTarget as IOrganization;
    const { _id: userId } = currentUser;
    let teams = {};
    const teamList = getTeamsOfSelectedOrg();
    try {
      if (isEnableNestedFolder) {
        const results = await getFoldersAvailability(orgId);

        setTotalFolders({
          ...totalFolders,
          [selectedTarget?._id]: {
            myDocuments: Number(results.personal),
            orgDocuments: Number(results.organization),
            teams: teamList.reduce((acc, team) => {
              acc[team._id] = Number(results.teams.includes(team._id));
              return acc;
            }, {} as Record<string, number>),
          },
        });
        return;
      }
      const [orgDocuments, myDocuments] = await Promise.all([
        getTotalFolders({ type: FolderType.ORGANIZATION, orgId }),
        getTotalFolders({ type: FolderType.PERSONAL, userId, orgId }),
        ...teamList.map(async (team) => {
          const total = await getTotalFolders({ type: FolderType.ORGANIZATION_TEAM, teamId: team._id });
          teams = {
            ...teams,
            [team._id]: total,
          };
        }),
      ]);

      setTotalFolders({
        ...totalFolders,
        [selectedTarget?._id]: {
          myDocuments,
          orgDocuments,
          teams,
        },
      });
    } catch (err) {
      if (isEnableNestedFolder) {
        return;
      }
      getTeamsOfSelectedOrg().forEach((team) => {
        teams = {
          ...teams,
          [team._id]: 1,
        };
      });
      setTotalFolders({
        ...totalFolders,
        [selectedTarget?._id]: {
          myDocuments: 1,
          orgDocuments: 1,
          teams,
        },
      });
      logger.logError({ error: err, reason: LOGGER.Service.GRAPHQL_ERROR, message: 'Failed to get total folders' });
    } finally {
      setLoading(false);
    }
  };

  const resetFolders = (): void => {
    setFolderData(initialFolderData);
  };

  const getPersonalFolders = (): void => {
    getFolders({
      type: FolderType.PERSONAL,
      source: currentUser._id,
      personalOnly: true,
    }).then((folders) => {
      if (context === ModalContext.MOVE) {
        return;
      }
      const { type, _id: destinationId } = destination;
      if (type === DestinationLocation.FOLDER) {
        const destinationFolder = folders.find((folder) => folder._id === destinationId);
        setDestination({
          ...destination,
          name: destinationFolder?.name,
          scrollTo: destinationId,
        });
      }
    });
  };

  const scrollToFolder = (): void => {
    const { belongsTo, _id: destinationId } = destination;
    getFolders({
      type: belongsTo.type.toLowerCase(),
      source: belongsTo._id,
    }).then((folders) => {
      const destinationFolder = folders.find((folder) => folder._id === destination._id);
      setExpandedItem(belongsTo._id || destinationId);
      setDestination({
        ...destination,
        name: destinationFolder?.name,
        scrollTo: destinationId,
      });
    });
  };

  useEffect(() => {
    if (isEnableNestedFolder) {
      if (isPersonalTargetSelected) {
        getNestedFolders({ rootType: RootTypes.Personal, withLoading: true }).then(() => {
          setDestination({
            ...destination,
            scrollTo: destination._id,
          });
        });
        return;
      }
      const shouldIgnoreInitScroll = context === ModalContext.MOVE || destination.type === DestinationLocation.PERSONAL;
      if (shouldIgnoreInitScroll) {
        return;
      }
      if (destination.type === DestinationLocation.FOLDER) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const rootTypeMapping = {
          [DestinationLocation.PERSONAL]: RootTypes.Personal,
          [DestinationLocation.ORGANIZATION]: RootTypes.Organization,
          [DestinationLocation.ORGANIZATION_TEAM]: RootTypes.Team,
        }[destination.belongsTo.type];
        if (rootTypeMapping) {
          getNestedFolders({ rootType: rootTypeMapping, teamId: destination.belongsTo._id }).then(() => {
            setDestination({
              ...destination,
              scrollTo: destination._id,
            });
          });
        }
        return;
      }
      setDestination({
        ...destination,
        scrollTo: destination._id,
      });
    }
  }, [isEnableNestedFolder]);

  useEffect(() => {
    if (isEnableNestedFolder) {
      return;
    }
    if (isPersonalTargetSelected) {
      getPersonalFolders();
      return;
    }
    if (context === ModalContext.MOVE) {
      return;
    }
    const { type, _id: destinationId } = destination;
    if (type === DestinationLocation.FOLDER) {
      scrollToFolder();
      return;
    }
    setDestination({
      ...destination,
      scrollTo: destinationId,
    });
  }, [isEnableNestedFolder]);

  useEffect(() => {
    if (!isEmpty(selectedTarget) && !isPersonalTargetSelected && !totalFolders[selectedTarget._id]) {
      setTotal();
    }
  }, [selectedTarget, isEnableNestedFolder]);

  useEffect(() => {
    setShowNotify(isOrganizationDocuments(destination));
    notify.set(false);
  }, [destination]);

  const contextValue = useMemo(
    () => ({
      getter: {
        personalData: {
          _id: currentUser._id,
          isOldProfessional: [Plans.PROFESSIONAL, Plans.PERSONAL].includes(currentUser.payment.type),
          originUser: currentUser,
        },
        selectedTarget,
        destination,
        getTeamsOfSelectedOrg,
        organizations,
        disableTarget,
        folderData,
        getFolders,
        error,
        documents,
        expandedItem,
        isProcessing,
        context: ModalContent[context],
        newDocumentName: newNameState.value,
        isDocumentNameOpen: newNameState.isOpen,
        errorName: newNameState.error,
        isShowNotify,
        isNotify: notify.value,
        isPersonalTargetSelected,
        totalFolders,
        loading,
        nestedFolderData,
      },
      setter: {
        setDestination,
        setSelectedTarget,
        onClose,
        setExpandedItem,
        setNewDocumentName: newNameState.dispatch,
        setErrorName: newNameState.setError,
        resetFolders,
        setIsNotify: notify.set,
        setPersonalTargetSelected,
        setLoading,
        getNestedFolders,
      },
      onSubmit,
    }),
    [
      isPersonalTargetSelected,
      currentUser,
      selectedTarget,
      destination,
      getTeamsOfSelectedOrg,
      organizations,
      disableTarget,
      folderData,
      getFolders,
      error,
      documents,
      expandedItem,
      onClose,
      onSubmit,
      isProcessing,
      setDestination,
      context,
      newNameState,
      notify,
      totalFolders,
      loading,
      setLoading,
      setSelectedTarget,
      isShowNotify,
      nestedFolderData,
      getNestedFolders,
    ]
  );

  return (
    <TransferDocumentContext.Provider value={contextValue}>
      <TransferDocument />
    </TransferDocumentContext.Provider>
  );
}

TransferDocumentContainer.defaultProps = {
  disableTarget: '',
  error: '',
  newNameState: {
    isOpen: false,
    value: '',
    dispatch: () => {},
  },
  defaultTarget: null,
  notify: {
    isShow: false,
    value: false,
    set: () => {},
  },
};
export default TransferDocumentContainer;
