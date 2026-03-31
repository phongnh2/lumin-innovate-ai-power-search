import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetCurrentOrganization } from 'hooks';

import { DOCUMENT_TYPE, folderType } from 'constants/documentConstants';

import { IOrganization } from 'interfaces/organization/organization.interface';
import { ITeam } from 'interfaces/team/team.interface';

import useChooseFileContext from './useChooseFileContext';
import { ActionTypes } from '../reducers/ChooseFile.reducer';
import { CurrentLocationType } from '../types';

export type BreadcrumbData = {
  name: string;
  onClick: () => void;
  _id: string;
};

const useHandleBreadcrumb = () => {
  const { t } = useTranslation();
  const { dispatch } = useChooseFileContext();
  const currentOrganization = useGetCurrentOrganization();

  const setCurrentLocation = useCallback((location: CurrentLocationType) => {
    dispatch({
      type: ActionTypes.SET_BREADCRUMB_DATA,
      payload: {
        breadcrumbData: [
          {
            _id: location._id,
            name: location.name,
            folderType: location.folderType,
          },
        ],
      },
    });
  }, []);

  const formatLocationData = ({ location, type }: { location: IOrganization | ITeam; type: string }) => {
    const { _id, name } = location;
    switch (type) {
      case DOCUMENT_TYPE.PERSONAL:
        return {
          name: t('sidebar.myDocuments'),
          _id: currentOrganization?._id,
          folderType: folderType.INDIVIDUAL,
        };
      case DOCUMENT_TYPE.ORGANIZATION:
        return {
          name: `All ${name}`,
          _id,
          folderType: folderType.ORGANIZATION,
        };
      case DOCUMENT_TYPE.ORGANIZATION_TEAM:
        return {
          name,
          _id,
          folderType: folderType.TEAMS,
        };
      default:
        return null;
    }
  };

  const setIndividualLocation = (org: IOrganization) => {
    setCurrentLocation(formatLocationData({ location: org, type: DOCUMENT_TYPE.PERSONAL }));
  };

  const setOrgLocation = (org: IOrganization) => {
    setCurrentLocation(formatLocationData({ location: org, type: DOCUMENT_TYPE.ORGANIZATION }));
  };

  const setTeamLocation = (team: ITeam) => {
    setCurrentLocation(formatLocationData({ location: team, type: DOCUMENT_TYPE.ORGANIZATION_TEAM }));
  };

  return {
    setIndividualLocation,
    setOrgLocation,
    setTeamLocation,
    formatLocationData,
  };
};

export default useHandleBreadcrumb;
