import debounce from 'lodash/debounce';
import { Button, Icomoon as KiwiIcomoon } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useSelector, shallowEqual } from 'react-redux';

import selectors from 'selectors';

import ButtonMaterial from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import PageTitlePortal from 'lumin-components/PortalElement/PageTitlePortal';
import Input from 'lumin-components/Shared/Input';
import { InputSize } from 'lumin-components/Shared/Input/types/InputSize';
import Tooltip from 'lumin-components/Shared/Tooltip';
import OrganizationListHeader from 'luminComponents/OrganizationList/components/OrganizationListHeader';
import { SearchInput } from 'luminComponents/ReskinLayout/components/SearchInput';

import { useDesktopMatch, useTabletMatch, useTranslation } from 'hooks';

import { hotjarUtils } from 'utils';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';

import { SEARCH_PLACEHOLDER, SEARCH_DELAY_TIME } from 'constants/customConstant';
import { HOTJAR_EVENT } from 'constants/hotjarEvent';
import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import { useHandleLeaveOrg } from '../../hooks/useHandleLeaveOrg';
import OrganizationMemberFilteringPermission from '../OrganizationMemberFilteringPermission';
import OrganizationMemberInfo from '../OrganizationMemberInfo';

import * as Styled from './TopSection.styled';

import styles from './TopSection.module.scss';

const tooltipStyle = {
  maxWidth: 400,
};

const TopSection = ({
  filteringPermission,
  renderPopperFilter,
  toggleAddDialog,
  toggleInfoDialog,
  toggleEditDialog,
  clearSearch,
  updateSearchText,
  updateInputText,
  totalPendingMembers,
  inputText,
  totalMembers,
  isReskin,
  sortOptions,
  setSortOptions,
  listType,
  isEmptySearchingResults,
}) => {
  const { t } = useTranslation();
  const isDesktopUp = useDesktopMatch();
  const isTabletUp = useTabletMatch();
  const currentOrganization = useSelector(selectors.getCurrentOrganization, shallowEqual).data || {};
  const { userRole, name: orgName } = currentOrganization;
  const currentUserRole = userRole.toUpperCase();
  const { handleLeaveOrg } = useHandleLeaveOrg();
  const isTablet = isTabletUp && !isDesktopUp;
  const [isShowInput, setIsShowInput] = useState(false);
  const textMember = t('common.members');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearch = useCallback(
    debounce((text = '') => {
      updateSearchText(text.trim());
    }, SEARCH_DELAY_TIME),
    []
  );

  const onTextChanged = (e) => {
    const text = e.target.value;
    updateInputText(text);
    debounceSearch(text);
  };

  const renderInputInTablet = () => {
    const onClickClear = () => {
      clearSearch();
      setIsShowInput(false);
    };

    return (
      <>
        <Styled.TitleMobile>{textMember}</Styled.TitleMobile>
        <Styled.Wrapper>
          {filteringPermission && (
            <OrganizationMemberFilteringPermission
              filteringPermission={filteringPermission}
              totalPendingMembers={totalPendingMembers}
              renderPopperFilter={renderPopperFilter}
              toggleAddDialog={() => toggleAddDialog(true)}
            />
          )}
          {!filteringPermission && (
            <Styled.InputTablet
              icon="search"
              size={InputSize.MEDIUM}
              onChange={onTextChanged}
              value={inputText}
              placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
              showClearButton={Boolean(inputText)}
              onClear={clearSearch}
            />
          )}
          {filteringPermission && (
            <Styled.ButtonSearch color={ButtonColor.GHOST} size={ButtonSize.LG} onClick={() => setIsShowInput(true)}>
              <Icomoon className="search" size={20} color={Colors.NEUTRAL_60} />
            </Styled.ButtonSearch>
          )}
          <Styled.InputWrapper $isShowInput={isShowInput}>
            <Input
              icon="search"
              size={InputSize.MEDIUM}
              onChange={onTextChanged}
              value={inputText}
              placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
              showClearButton={Boolean(inputText)}
              onClear={onClickClear}
              fullWidth
            />
          </Styled.InputWrapper>
          <OrganizationMemberInfo
            toggleInfoDialog={() => toggleInfoDialog(true)}
            handleLeaveOrg={handleLeaveOrg}
            toggleEditDialog={toggleEditDialog}
            currentUserRole={currentUserRole}
            totalMembers={totalMembers}
          />
        </Styled.Wrapper>
      </>
    );
  };

  const renderContainer = () => {
    if (isTablet) {
      return renderInputInTablet();
    }

    return (
      <>
        <Styled.TitleMobile>{textMember}</Styled.TitleMobile>
        <Styled.Wrapper>
          <Styled.Edit>
            {filteringPermission && (
              <OrganizationMemberFilteringPermission
                filteringPermission={filteringPermission}
                totalPendingMembers={totalPendingMembers}
                renderPopperFilter={renderPopperFilter}
                toggleAddDialog={() => toggleAddDialog(true)}
              />
            )}
            <Input
              icon="search"
              size={InputSize.MEDIUM}
              onChange={onTextChanged}
              value={inputText}
              placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
              showClearButton={Boolean(inputText)}
              onClear={clearSearch}
              fullWidth
            />
          </Styled.Edit>
          <OrganizationMemberInfo
            toggleInfoDialog={() => toggleInfoDialog(true)}
            handleLeaveOrg={handleLeaveOrg}
            toggleEditDialog={toggleEditDialog}
            currentUserRole={currentUserRole}
            totalMembers={totalMembers}
          />
        </Styled.Wrapper>
      </>
    );
  };

  if (isReskin) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>{t('memberPage.orgMembers', { orgName })}</h2>
        <div className={styles.wrapper} data-with-invite-btn={filteringPermission}>
          <SearchInput
            size="lg"
            width="100%"
            onChange={onTextChanged}
            value={inputText}
            placeholder={t(SEARCH_PLACEHOLDER.SEARCH_EMAIL)}
            className={styles.searchInput}
          />
          {filteringPermission && (
            <Button
              data-lumin-btn-name={ButtonName.INVITE_CIRCLE_MEMBER}
              size="lg"
              onClick={() => {
                toggleAddDialog(true);
                hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
              }}
              startIcon={<KiwiIcomoon type="user-plus-lg" size="lg" />}
            >
              {t('memberPage.inviteMembers')}
            </Button>
          )}
          <OrganizationMemberInfo
            toggleInfoDialog={() => toggleInfoDialog(true)}
            handleLeaveOrg={handleLeaveOrg}
            toggleEditDialog={toggleEditDialog}
            currentUserRole={currentUserRole}
            totalMembers={totalMembers}
          />
        </div>
        {isEmptySearchingResults ? null : (
          <OrganizationListHeader
            listType={listType}
            isPendingMember={listType === ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER}
            setSortOptions={setSortOptions}
            sortOptions={sortOptions}
            totalSignSeats={currentOrganization.totalSignSeats}
            availableSignSeats={currentOrganization.availableSignSeats}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {isDesktopUp && (
        <PageTitlePortal.Element>
          <Styled.LeftNavigation>
            <Styled.TitleWrapper>
              <Styled.TitleDesktop>{textMember}</Styled.TitleDesktop>
              <Tooltip
                title={t('memberPage.membersOfOrgName', { orgName })}
                tooltipStyle={tooltipStyle}
                placement="bottom-start"
              >
                <Icomoon className="info" size={18} color={Colors.NEUTRAL_60} />
              </Tooltip>
            </Styled.TitleWrapper>
            {filteringPermission && (
              <ButtonMaterial
                data-lumin-btn-name={ButtonName.INVITE_CIRCLE_MEMBER}
                size={ButtonSize.LG}
                onClick={() => {
                  toggleAddDialog(true);
                  hotjarUtils.trackEvent(HOTJAR_EVENT.MODAL_VIEWED_INVITE_CIRCLE_MEMBER);
                }}
              >
                <Icomoon className="add-member" size={18} color={Colors.WHITE} />
                <Styled.TextButton>{t('memberPage.inviteMembers')}</Styled.TextButton>
              </ButtonMaterial>
            )}
          </Styled.LeftNavigation>
        </PageTitlePortal.Element>
      )}

      <Styled.Container>{renderContainer()}</Styled.Container>
    </>
  );
};

TopSection.propTypes = {
  filteringPermission: PropTypes.bool,
  renderPopperFilter: PropTypes.func,
  toggleAddDialog: PropTypes.func,
  toggleInfoDialog: PropTypes.func,
  toggleEditDialog: PropTypes.func,
  clearSearch: PropTypes.func,
  updateSearchText: PropTypes.func,
  updateInputText: PropTypes.func,
  inputText: PropTypes.string,
  totalPendingMembers: PropTypes.number,
  totalMembers: PropTypes.number,
  isReskin: PropTypes.bool,
  setSortOptions: PropTypes.func,
  sortOptions: PropTypes.object,
  listType: PropTypes.string,
  isEmptySearchingResults: PropTypes.bool,
};

TopSection.defaultProps = {
  filteringPermission: false,
  renderPopperFilter: () => {},
  toggleAddDialog: () => {},
  toggleInfoDialog: () => {},
  toggleEditDialog: () => {},
  clearSearch: () => {},
  updateSearchText: () => {},
  updateInputText: () => {},
  inputText: 0,
  totalPendingMembers: 0,
  totalMembers: 0,
  isReskin: false,
  setSortOptions: () => {},
  sortOptions: {},
  listType: '',
  isEmptySearchingResults: false,
};

export default TopSection;
