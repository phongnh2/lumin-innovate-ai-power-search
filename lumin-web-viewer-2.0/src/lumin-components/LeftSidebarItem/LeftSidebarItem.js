import Collapse from '@mui/material/Collapse';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';
import { useMatch } from 'react-router';
import { NavLink } from 'react-router-dom';

import selectors from 'selectors';

import Icomoon from 'lumin-components/Icomoon';
import { HamburgerContext } from 'lumin-components/NavigationBar/components/Hamburger/context';
import { ChipSize } from 'luminComponents/Shared/Chip/types';
import Tooltip from 'luminComponents/Shared/Tooltip';

import Handler from 'HOC/OfflineStorageHOC/Handler/Handler';

import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';
import { ORG_PATH } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';

import LeftSidebarItemChild from './components/LeftSidebarItemChild';
import LeftSidebarItemParent from './components/LeftSidebarItemParent';

import * as Styled from './LeftSidebarItem.styled';

const propTypes = {
  special: PropTypes.bool,
  className: PropTypes.string,
  link: PropTypes.string,
  iconName: PropTypes.string,
  iconSize: PropTypes.number,
  text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  isCollapseList: PropTypes.bool,
  active: PropTypes.bool,
  isSubItem: PropTypes.bool,
  onClick: PropTypes.func,
  renderItems: PropTypes.func,
  arrowTooltip: PropTypes.object,
  isLastItem: PropTypes.bool,
  nested: PropTypes.bool,
  isDocumentUrl: PropTypes.bool,
  onCollapseListClick: PropTypes.func,
  isOpen: PropTypes.bool,
  isDocumentCollapseList: PropTypes.bool,
  isDocTeamMenu: PropTypes.bool,
  showUploadDocumentGuide: PropTypes.bool,
  dataLuminBtnName: PropTypes.string,
  dataLuminBtnEventType: PropTypes.string,
  openInNewTab: PropTypes.bool,
  customIcon: PropTypes.element,
  betaVersionLabel: PropTypes.string,
};
const defaultProps = {
  dataLuminBtnName: '',
  dataLuminBtnEventType: '',
  special: false,
  className: '',
  link: '/',
  iconName: '',
  iconSize: 16,
  text: '',
  isCollapseList: false,
  active: false,
  isSubItem: false,
  onClick: () => {},
  renderItems: () => {},
  arrowTooltip: {
    open: null,
    close: null,
  },
  isLastItem: false,
  nested: false,
  isDocumentUrl: false,
  onCollapseListClick: () => {},
  isOpen: false,
  isDocumentCollapseList: false,
  isDocTeamMenu: false,
  showUploadDocumentGuide: false,
  openInNewTab: false,
  customIcon: null,
  betaVersionLabel: '',
};

function LeftSidebarItem({
  dataLuminBtnName,
  dataLuminBtnEventType,
  special,
  className,
  link,
  iconName,
  iconSize,
  text,
  isCollapseList,
  active,
  isSubItem,
  onClick,
  renderItems,
  arrowTooltip,
  isLastItem,
  nested,
  isDocumentUrl,
  onCollapseListClick,
  isOpen,
  isDocumentCollapseList,
  isDocTeamMenu,
  showUploadDocumentGuide,
  openInNewTab,
  customIcon,
  betaVersionLabel,
}) {
  const { closeMenu } = useContext(HamburgerContext) || {};
  const isOffline = useSelector(selectors.isOffline);
  const offlineDocumentListUrl = useSelector(selectors.getOfflineDocumentListUrl) || '/documents/personal';
  const isInOrgPage = useMatch(ORG_PATH);
  const color = active ? Colors.NEUTRAL_80 : Colors.NEUTRAL_60;

  const getIsDisabled = () => {
    const forceEnablePersonalTab = offlineDocumentListUrl.endsWith(DocumentFolderTypeTab.DEVICE) &&
      link.endsWith(DocumentFolderTypeTab.PERSONAL);

    if (Handler.isOfflineEnabled && link.endsWith(DocumentFolderTypeTab.DEVICE)
      || forceEnablePersonalTab
      || isDocumentCollapseList) {
      return false;
    }
    if (!isDocumentUrl) {
      return isOffline;
    }
    const isOrgDocUrl = (offlineDocumentListUrl || '').startsWith(`/${DocumentFolderTypeTab.ORGANIZATION}}`);
    if (!isInOrgPage && isOrgDocUrl) {
      return isOffline && !link.endsWith(DocumentFolderTypeTab.PERSONAL);
    }

    const enableTeamCollapse = isDocTeamMenu && offlineDocumentListUrl.includes('/documents/team');

     return isOffline && !enableTeamCollapse && (!offlineDocumentListUrl.includes(link) || isCollapseList);
  };
  const isDisabled = getIsDisabled();

  const withCloseMenu = (callback) => (e) => {
    if (!isDisabled && closeMenu) {
      closeMenu();
    }
    callback(e);
  };

  const getTrackingEventProps = () => {
    const trackingEventProps = dataLuminBtnName
      ? {
          'data-lumin-btn-name': dataLuminBtnName,
        }
      : {};
    if (dataLuminBtnName && dataLuminBtnEventType) {
      trackingEventProps['data-lumin-btn-event-type'] = dataLuminBtnEventType;
    }
    return { trackingEventProps };
  };

  const ButtonComponent = isSubItem
    ? Styled.ButtonContainerSecondary
    : Styled.ButtonContainerPrimary;

  const renderIcon = useCallback(
    () => customIcon || <Icomoon className={iconName} size={iconSize} color={special ? Colors.SECONDARY_50 : ''} />,
    [customIcon, iconName, iconSize, special]
  );

  const renderContent = () => {
    if (isSubItem) {
      return (
        <Styled.ContainerSubItem $active={active}>
          <Styled.TextName
            style={active ? { marginRight: 16 } : null}
            active={active}
          >
            {text}
          </Styled.TextName>
          {active && (
            <Icomoon className="check" size={12} color={Colors.PRIMARY_90} />
          )}
        </Styled.ContainerSubItem>
      );
    }
    return (
      <Styled.Container active={active} $isCollapseList={isCollapseList}>
        {renderIcon()}
        <Styled.SidebarItemNameWrapper>
          <Styled.TextName isHighlight={special} active={active} $isBeta={Boolean(betaVersionLabel)}>
            {text}
          </Styled.TextName>
          {betaVersionLabel && (
            <Styled.BetaVersion
              size={ChipSize.MD}
              label={betaVersionLabel}
              color={Colors.NEUTRAL_80}
              backgroundColor="transparent"
            />
          )}
        </Styled.SidebarItemNameWrapper>
        {isCollapseList && (
          <Tooltip
            title={!isOpen ? arrowTooltip.open : arrowTooltip.close}
            placement="top"
          >
            <Styled.ArrowContainer isOpen={isOpen}>
              <Icomoon className="dropdown" size={10} color={color} />
            </Styled.ArrowContainer>
          </Tooltip>
        )}
      </Styled.Container>
    );
  };

  const extendProps = link ? {
    exact: false,
    strict: true,
  } : {};

  if (isCollapseList) {
    return (
      <div>
        <LeftSidebarItemParent
          active={active}
          onCollapseListClick={onCollapseListClick}
          isLastItem={isLastItem}
          link={link}
          className={className}
          isCollapseList={isCollapseList}
          iconName={iconName}
          special={special}
          text={text}
          isOpen={isOpen}
          arrowTooltip={arrowTooltip}
          color={color}
          nested={nested}
          isDisabled={isDisabled}
          {...extendProps}
        />
        <Collapse in={isOpen}>{renderItems && renderItems()}</Collapse>
      </div>
    );
  }

  const { trackingEventProps } = getTrackingEventProps();
  if (isSubItem) {
    return (
      <LeftSidebarItemChild
        nested={nested}
        active={active}
        text={text}
        link={link}
        isDisabled={isDisabled}
        className={className}
        showUploadDocumentGuide={showUploadDocumentGuide}
        {...trackingEventProps}
      />
    );
  }
  return (
    <ButtonComponent
      $isLastItem={isLastItem}
      onClick={withCloseMenu(onClick)}
      as={link && NavLink}
      to={link}
      target={openInNewTab ? '_blank' : '_self'}
      className={classNames(className, { active })}
      $isCollapseList={isCollapseList}
      $isActive={active}
      $isDisabled={!active && isDisabled}
      {...trackingEventProps}
    >
      {renderContent()}
    </ButtonComponent>
  );
}

LeftSidebarItem.propTypes = propTypes;
LeftSidebarItem.defaultProps = defaultProps;

export default React.memo(LeftSidebarItem);
