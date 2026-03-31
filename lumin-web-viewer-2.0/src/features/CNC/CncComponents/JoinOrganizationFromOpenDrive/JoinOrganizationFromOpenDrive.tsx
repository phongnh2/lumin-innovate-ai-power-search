import { Button, ButtonSize, ButtonVariant } from 'lumin-ui/dist/kiwi-ui';
import React from 'react';
import { useLocation, useNavigate } from 'react-router';

import selectors from 'selectors';

import { LayoutSecondary } from 'lumin-components/Layout';

import { useGetCurrentUser, useShallowSelector, useTranslation } from 'hooks';

import { CNCButtonName, CNCButtonPurpose } from 'features/CNC/constants/events/button';
import OrganizationsSorter from 'features/CNC/helpers/sortOrganizations';
import {
  CNC_ONBOARDING_FLOW_VARIANT,
  useGetOnboardingFlowFromOpenDriveFlag,
} from 'features/CNC/hooks/useGetOnboardingFlowFromOpenDriveFlag';
import { useGetSuggestedOrgListOfUser } from 'features/CNC/hooks/useGetSuggestedOrgListOfUser';

import { OrganizationList } from 'interfaces/redux/organization.redux.interface';

import JoinOrganizationFromOpenDriveContainer from './components/JoinOrganizationFromOpenDriveContainer';
import OrganizationListFromOpenDrive from './components/OrganizationListFromOpenDrive';

import styles from './JoinOrganizationFromOpenDrive.module.scss';

interface LocationStateProps {
  documentId: string;
}

const JoinOrganizationFromOpenDrive = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { orgList: suggestedOrgList, loading } = useGetSuggestedOrgListOfUser();
  const documentId = (location.state as LocationStateProps)?.documentId;
  const { data: organizations } = useShallowSelector<OrganizationList>(selectors.getOrganizationList);
  const currentOrganizationIds = new Set(organizations?.map((item) => item?.organization?._id));
  const orgListFiltered = suggestedOrgList?.filter(
    (item) => !currentOrganizationIds.has(item?._id) && Boolean(item?.status)
  );
  const { variant } = useGetOnboardingFlowFromOpenDriveFlag();
  const shouldShowOrgListSortedByIpAddress = CNC_ONBOARDING_FLOW_VARIANT.VARIANT_B === variant;
  const currentUser = useGetCurrentUser();
  const userHashedIpAddress = currentUser?.hashedIpAddress || '';

  const orgListSorted = new OrganizationsSorter(orgListFiltered)
    .sort(userHashedIpAddress, shouldShowOrgListSortedByIpAddress)
    .getOrgList();

  const onSkip = () => {
    window.history.replaceState(null, '');
    navigate(`/viewer/${documentId}`);
  };

  return (
    <JoinOrganizationFromOpenDriveContainer orgList={orgListSorted} loading={loading} documentId={documentId}>
      <LayoutSecondary footer={false} hasBackButton={false} canClickLogo={false}>
        <div className={styles.container}>
          <div className={styles.paper}>
            <div className={styles.title}>{t('joinOrg.title')}</div>
            <h1 className={styles.description}>{t('googleOnboarding.titleDescription')}</h1>
            <OrganizationListFromOpenDrive
              orgList={orgListSorted}
              loading={loading}
              onSkip={onSkip}
              documentId={documentId}
            />
            <div className={styles.wrapButton}>
              <Button
                variant={ButtonVariant.text}
                size={ButtonSize.lg}
                onClick={onSkip}
                data-lumin-btn-name={CNCButtonName.SKIP_ONBOARDING_FLOW_FROM_OPEN_DRIVE}
                data-lumin-btn-purpose={CNCButtonPurpose[CNCButtonName.SKIP_ONBOARDING_FLOW_FROM_OPEN_DRIVE]}
                disabled={loading}
                fullWidth
              >
                {t('googleOnboarding.skip')}
              </Button>
            </div>
          </div>
        </div>
      </LayoutSecondary>
    </JoinOrganizationFromOpenDriveContainer>
  );
};

export default JoinOrganizationFromOpenDrive;
