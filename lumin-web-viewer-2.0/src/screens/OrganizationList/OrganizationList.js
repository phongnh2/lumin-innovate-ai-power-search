import { Text, Button, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import AddMemberOrganizationModal from 'lumin-components/AddMemberOrganizationModal';
import CustomHeader from 'lumin-components/CustomHeader';
import EmptyOrgList from 'lumin-components/EmptyOrgList';
import Icomoon from 'lumin-components/Icomoon';
import { LayoutSecondary } from 'lumin-components/Layout';
import Tooltip from 'lumin-components/Shared/Tooltip';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { commonUtils, hotjarUtils } from 'utils';
import { ButtonName, ButtonPurpose } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { Routers } from 'constants/Routers';
import { Colors } from 'constants/styles';

import OrganizationListItem from './OrganizationListItem';

import * as Styled from './OrganizationList.styled';

import styles from './OrganizationList.module.scss';

const propTypes = {
  organizations: PropTypes.object,
};

const defaultProps = {
  organizations: { data: [] },
};

const tooltipStyle = {
  maxWidth: 400,
};

const OrganizationList = ({ organizations: { data: organizationList, loading: loadingOrg } }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isEnableReskin } = useEnableWebReskin();

  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState({});
  const setCurrentOrgAndOpenDialog = (e, organization) => {
    hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
    e.preventDefault();
    setCurrentOrganization(organization);
    setIsOpenDialog(true);
    hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
  };

  const closeDialog = () => {
    setCurrentOrganization({});
    setIsOpenDialog(false);
  };

  const addMemberMobileBtnHandler = (e, organization) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentOrgAndOpenDialog(e, organization);
  };

  const renderOrgList = (isReskin) => {
    if (loadingOrg) {
      return <Styled.Loading normal useReskinCircularProgress={isReskin} />;
    }

    if (!organizationList?.length) {
      return <EmptyOrgList isReskin={isReskin} />;
    }

    if (isReskin) {
      return (
        <div className={styles.orgListContainer}>
          {organizationList.map(({ organization, role }) => (
            <OrganizationListItem
              key={organization._id}
              organization={organization}
              role={role}
              setCurrentOrgAndOpenDialog={setCurrentOrgAndOpenDialog}
              addMemberMobileBtnHandler={addMemberMobileBtnHandler}
              isReskin
            />
          ))}
          {isOpenDialog && (
            <AddMemberOrganizationModal
              selectedOrganization={currentOrganization}
              updateCurrentOrganization={() => {}}
              open
              onClose={closeDialog}
              onSaved={closeDialog}
            />
          )}
        </div>
      );
    }

    return (
      <>
        <Styled.GridContainer>
          <Styled.GridItem>
            <Link
              to={Routers.ORGANIZATION_CREATE}
              data-lumin-btn-name={ButtonName.ORGANIZATION_CREATION_REDIRECT_FROM_ORG_LIST}
              data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORGANIZATION_CREATION_REDIRECT_FROM_ORG_LIST]}
            >
              <Styled.CreateBtn>
                <Styled.ContentCreateBtn>
                  <Icomoon className="plus-thin" size={22} color={Colors.NEUTRAL_100} />
                  <Styled.CreateTitle>
                    {commonUtils.formatTitleCaseByLocale(t('listOrgs.createNew'))}
                  </Styled.CreateTitle>
                </Styled.ContentCreateBtn>
              </Styled.CreateBtn>
            </Link>
          </Styled.GridItem>
          {organizationList.map(({ organization, role }) => (
            <OrganizationListItem
              key={organization._id}
              organization={organization}
              role={role}
              setCurrentOrgAndOpenDialog={setCurrentOrgAndOpenDialog}
              addMemberMobileBtnHandler={addMemberMobileBtnHandler}
            />
          ))}
        </Styled.GridContainer>
        {isOpenDialog && (
          <AddMemberOrganizationModal
            selectedOrganization={currentOrganization}
            updateCurrentOrganization={() => {}}
            open
            onClose={closeDialog}
            onSaved={closeDialog}
          />
        )}
      </>
    );
  };

  return (
    <>
      <CustomHeader metaTitle={t('metaTitle.orgList')} description={t('metaDescription.orgList')} />
      <LayoutSecondary
        footer={false}
        isReskin={isEnableReskin}
        backgroundColor={isEnableReskin && 'var(--kiwi-colors-surface-surface-container-low)'}
      >
        {isEnableReskin ? (
          <div className={styles.container}>
            <div className={styles.titleWrapper}>
              <div className={styles.leftSection}>
                <Text type="headline" size="xl" color="var(--kiwi-colors-surface-on-surface)">
                  {t('organizations', { ns: 'terms' })}
                </Text>
                <Text type="body" size="lg" color="var(--kiwi-colors-surface-on-surface-variant)">
                  {t('listOrgs.descriptionPage')}
                </Text>
              </div>
              <div className={styles.rightSection}>
                {!loadingOrg && (
                  <Button
                    size="lg"
                    startIcon={<KiwiIcomoon type="plus-lg" size="lg" />}
                    onClick={() => navigate(Routers.ORGANIZATION_CREATE)}
                    data-lumin-btn-name={ButtonName.ORGANIZATION_CREATION_REDIRECT_FROM_ORG_LIST}
                    data-lumin-btn-purpose={ButtonPurpose[ButtonName.ORGANIZATION_CREATION_REDIRECT_FROM_ORG_LIST]}
                  >
                    {organizationList?.length ? t('listOrgs.createNew') : t('listOrgs.createANewOrg')}
                  </Button>
                )}
              </div>
            </div>
            {renderOrgList(true)}
          </div>
        ) : (
          <Styled.Container>
            <Styled.TitleWrapper>
              <Styled.OrgListTitle>{t('common.circles')}</Styled.OrgListTitle>
              <Tooltip title={t('listOrgs.descriptionPage')} tooltipStyle={tooltipStyle} placement="bottom-start">
                <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
              </Tooltip>
            </Styled.TitleWrapper>
            {renderOrgList()}
          </Styled.Container>
        )}
      </LayoutSecondary>
    </>
  );
};

OrganizationList.propTypes = propTypes;
OrganizationList.defaultProps = defaultProps;

export default OrganizationList;
