import { Avatar, Icomoon, IconButton, ScrollArea } from 'lumin-ui/kiwi-ui';
import React from 'react';

import DefaultOrgAvatar from 'assets/reskin/lumin-svgs/default-org-avatar.png';
import DefaultTeamAvatar from 'assets/reskin/lumin-svgs/default-team-avatar.png';

import selectors from 'selectors';

import { useGetCurrentOrganization, useTranslation } from 'hooks';
import useKeyboardAccessibility from 'hooks/useKeyboardAccessibility';
import useShallowSelector from 'hooks/useShallowSelector';

import { avatar } from 'utils';

import { useChooseFileContext, useHandleBreadcrumb } from 'features/ChooseFile/hooks';
import { ActionTypes } from 'features/ChooseFile/reducers/ChooseFile.reducer';
import { LocationTypes } from 'features/ChooseFile/types';

import { ITeam } from 'interfaces/team/team.interface';

import styles from './LocationList.module.scss';

const LocationList = () => {
  const { setIndividualLocation, setOrgLocation, setTeamLocation } = useHandleBreadcrumb();

  const { t } = useTranslation();
  const currentOrg = useGetCurrentOrganization();
  const teamList = useShallowSelector<ITeam[]>(selectors.getTeams) || [];

  const { dispatch } = useChooseFileContext();
  const { onKeyDown } = useKeyboardAccessibility();

  const handleClick = (type: LocationTypes, teamData?: ITeam) => {
    dispatch({ type: ActionTypes.SET_LOCATION_LOADING, payload: { value: true } });
    switch (type) {
      case LocationTypes.Personal: {
        setIndividualLocation(currentOrg);
        break;
      }
      case LocationTypes.Organization: {
        setOrgLocation(currentOrg);
        break;
      }
      case LocationTypes.Team: {
        setTeamLocation(teamData);
        break;
      }
      default:
        break;
    }
  };

  return (
    <ScrollArea
      classNames={{
        root: styles.scrollAreaRoot,
      }}
    >
      <div
        role="button"
        tabIndex={0}
        data-cy="choose_a_file_to_edit_personal_doc_location"
        className={styles.locationItem}
        onKeyDown={onKeyDown}
        onClick={() => handleClick(LocationTypes.Personal)}
      >
        <div className={styles.leftSection}>
          <Icomoon type="file-type-pdf-lg" size="lg" color="var(--kiwi-colors-surface-on-surface)" />
          <span className={styles.name}>{t('sidebar.myDocuments')}</span>
        </div>
        <div className={styles.rightSection}>
          <IconButton size="sm" icon="chevron-right-sm" />
        </div>
      </div>
      <div className={styles.spaceListWrapper}>
        <span className={styles.title}>{t('common.teams')}</span>
        <div className={styles.spaceList}>
          <div
            role="button"
            tabIndex={0}
            data-cy="choose_a_file_to_edit_org_doc_location"
            key={currentOrg._id}
            className={styles.locationItem}
            onKeyDown={onKeyDown}
            onClick={() => handleClick(LocationTypes.Organization)}
          >
            <div className={styles.leftSection}>
              <Avatar
                src={avatar.getAvatar(currentOrg.avatarRemoteId) || DefaultOrgAvatar}
                placeholder={<img src={DefaultOrgAvatar} alt={`${t('organization', { ns: 'terms' })} avatar`} />}
                size="xs"
                variant="outline"
              />
              <span className={styles.name}>All {currentOrg.name}</span>
            </div>
            <div className={styles.rightSection}>
              <IconButton size="sm" icon="chevron-right-sm" />
            </div>
          </div>
          {teamList.map((team) => (
            <div
              key={team._id}
              role="button"
              tabIndex={0}
              data-cy="choose_a_file_to_edit_team_doc_location"
              className={styles.locationItem}
              onKeyDown={onKeyDown}
              onClick={() => handleClick(LocationTypes.Team, team)}
            >
              <div className={styles.leftSection}>
                <Avatar
                  src={avatar.getAvatar(team.avatarRemoteId) || DefaultTeamAvatar}
                  name={team.name}
                  size="xs"
                  variant="outline"
                />
                <span className={styles.name}>{team.name}</span>
              </div>
              <div className={styles.rightSection}>
                <IconButton size="sm" icon="chevron-right-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};

export default LocationList;
