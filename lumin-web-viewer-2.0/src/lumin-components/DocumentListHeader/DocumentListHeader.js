import classNames from 'classnames';
import { Menu, MenuItem, Icomoon as KiwiIcomoon, IconButton } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

import documentItemStyles from '@web-new-ui/components/DocumentListItem/DocumentListItem.module.scss';

import Icomoon from 'luminComponents/Icomoon';
import PopperButton from 'luminComponents/PopperButton';
import HeaderPopperMenu from 'luminComponents/Shared/HeaderPopperMenu';

import { useGetFolderType, useTranslation, useEnableWebReskin, usePersonalDocPathMatch } from 'hooks';

import { useChatbotStore } from 'features/WebChatBot/hooks/useChatbotStore';

import {
  ownedOptions,
  filterCondition,
  ownerFilter,
  folderType,
  layoutType,
  modifiedFilter,
} from 'constants/documentConstants';
import { CHECKBOX_TYPE } from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import * as Styled from './DocumentListHeader.styled';

import styles from './DocumentListHeader.module.scss';

const propTypes = {
  ownedFilterCondition: PropTypes.string,
  setOwnedFilter: PropTypes.func,
  setLastModifiedFilter: PropTypes.func,
  type: PropTypes.oneOf(Object.values(layoutType)).isRequired,
  isEmptyList: PropTypes.bool.isRequired,
  selectedDocList: PropTypes.array,
  selectDocMode: PropTypes.bool.isRequired,
  setSelectDocMode: PropTypes.func.isRequired,
  setRemoveDocList: PropTypes.func.isRequired,
  setRemoveFolderList: PropTypes.func,
};

const defaultProps = {
  ownedFilterCondition: ownerFilter.byAnyone,
  setOwnedFilter: () => {},
  setLastModifiedFilter: () => {},
  selectedDocList: [],
  setRemoveFolderList: () => {},
};

function DocumentListHeader({
  ownedFilterCondition,
  setOwnedFilter,
  setLastModifiedFilter,
  type,
  isEmptyList,
  selectedDocList,
  selectDocMode,
  setSelectDocMode,
  setRemoveDocList,
  setRemoveFolderList,
}) {
  const { t } = useTranslation();
  const currentFolderType = useGetFolderType();

  const { isEnableReskin } = useEnableWebReskin();

  const { isVisible } = useChatbotStore();

  const isPersonalDocumentsRoute = usePersonalDocPathMatch();

  const activeOwnedOption = ownedOptions.findIndex((options) => options.value === ownedFilterCondition);

  useEffect(
    () => () => {
      setOwnedFilter(ownerFilter.byAnyone);
      setLastModifiedFilter(modifiedFilter.modifiedByAnyone);
    },
    [currentFolderType]
  );

  const changeFilterCondition = (filterType, option) => {
    switch (filterType) {
      case filterCondition.ownerFilter:
        setOwnedFilter(option);
        break;
      case filterCondition.modifiedFilter:
        setLastModifiedFilter(modifiedFilter.modifiedByAnyone);
        break;
      default:
        break;
    }
  };

  const onToggleSelection = () => {
    setSelectDocMode(!selectDocMode);
    if (selectDocMode) {
      setRemoveFolderList({ data: [], type: CHECKBOX_TYPE.DELETE });
      setRemoveDocList({ data: [], type: CHECKBOX_TYPE.DELETE });
    }
  };

  const canShowDropdown = [folderType.STARRED, folderType.ORGANIZATION, folderType.TEAMS].includes(currentFolderType);

  const ownerWord = t('common.owner');

  const ReskinComponents = isEnableReskin
    ? {
        Title: Styled.TitleReskin,
        OwnerTitle: Styled.OwnerTitleReskin,
        TitleTablet: Styled.TitleTabletReskin,
        UploadedTitle: Styled.UploadedTitleReskin,
        Container: Styled.ContainerReskin,
        SelectDocument: Styled.SelectDocumentReskin,
      }
    : {
        Title: Styled.Title,
        OwnerTitle: Styled.OwnerTitle,
        TitleTablet: Styled.TitleTablet,
        UploadedTitle: Styled.UploadedTitle,
        Container: Styled.Container,
        SelectDocument: Styled.SelectDocument,
      };
  const renderOwnerMenuReskin = () => (
    <div className={styles.ownerTitle} data-filterable>
      <Menu
        ComponentTarget={
          <div>
            <span style={{ marginRight: 12 }}>{ownerWord}</span>
            <IconButton size="sm" icon="caret-down-filled-sm" iconColor="var(--kiwi-colors-surface-on-surface-variant)" />
          </div>
        }
        width={140}
        position="bottom-end"
      >
        {ownedOptions.map((option, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              changeFilterCondition(filterCondition.ownerFilter, option.value);
            }}
            rightSection={
              index === activeOwnedOption && (
                <KiwiIcomoon type="check-sm" color="var(--kiwi-colors-surface-on-surface-variant)" />
              )
            }
            style={{ minHeight: 40 }}
          >
            {t(option.label)}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );

  const renderOwnerMenu = () => (
    <PopperButton
      ButtonComponent="div"
      popperProps={{
        scrollWillClosePopper: true,
      }}
      renderPopperContent={({ closePopper }) => (
        <HeaderPopperMenu
          data={ownedOptions}
          activeOption={activeOwnedOption}
          handleClick={(option) => {
            changeFilterCondition(filterCondition.ownerFilter, option.value);
            closePopper();
          }}
        />
      )}
    >
      <ReskinComponents.OwnerTitle style={isEnableReskin ? { marginLeft: '-8px' } : {}} $filterable>
        <span style={{ marginRight: 12 }}>{ownerWord}</span>
        <Icomoon className="dropdown" color={Colors.NEUTRAL_50} size={8} />
      </ReskinComponents.OwnerTitle>
    </PopperButton>
  );

  const renderDropdown = () => (isEnableReskin ? renderOwnerMenuReskin() : renderOwnerMenu());

  const renderCreatorHeader = () =>
    type === layoutType.list &&
    (canShowDropdown ? renderDropdown() : <ReskinComponents.OwnerTitle>{ownerWord}</ReskinComponents.OwnerTitle>);

  const renderToggleSelection = () => (
    <ReskinComponents.SelectDocument
      className={classNames({ 'kiwi-typography-label-md': isEnableReskin })}
      onClick={onToggleSelection}
    >
      {selectDocMode ? t('common.cancel') : t('common.select')}
    </ReskinComponents.SelectDocument>
  );

  const docTitle = type === layoutType.list ? t('common.name') : t('documentPage.foldersAndFiles');

  if (isEnableReskin) {
    if (isEmptyList || Boolean(selectedDocList.length) || selectDocMode) {
      return null;
    }
    return (
      <div
        data-chatbot-opened={isVisible}
        className={classNames(
          styles.container,
          isPersonalDocumentsRoute
            ? documentItemStyles.wrapperWithoutOwnerName
            : documentItemStyles.wrapperWithOwnerName,
          { [styles.wrapperWithOwnerName]: !isPersonalDocumentsRoute }
        )}
        data-header
      >
        <div className={styles.displayTablet}>
          {!selectDocMode ? (
            renderToggleSelection()
          ) : (
            <ReskinComponents.Title>{t('common.name')}</ReskinComponents.Title>
          )}
        </div>
        <div className={styles.uploadedTitle}>{docTitle}</div>
        {isPersonalDocumentsRoute ? null : renderCreatorHeader()}
        <div className={classNames(styles.column, styles.storage)} data-display={type === layoutType.list}>
          {t('common.storage')}
        </div>
        <div className={classNames(styles.column, styles.lastOpened)} data-display={type === layoutType.list}>
          {t('documentPage.lastOpened')}
        </div>
        <div className={styles.mobileDisplay}>{renderToggleSelection()}</div>
      </div>
    );
  }

  return (
    <ReskinComponents.Container
      $isEmpty={isEmptyList}
      $isSelecting={Boolean(selectedDocList.length) || selectDocMode}
      $isPersonalDocumentsRoute={isPersonalDocumentsRoute}
    >
      <Styled.DisplayTablet>
        {!selectDocMode ? (
          renderToggleSelection()
        ) : (
          <ReskinComponents.Title>{t('common.uploaded')}</ReskinComponents.Title>
        )}
      </Styled.DisplayTablet>
      <ReskinComponents.UploadedTitle>{t('common.uploaded')}</ReskinComponents.UploadedTitle>
      {isEnableReskin && isPersonalDocumentsRoute ? null : renderCreatorHeader()}
      <ReskinComponents.TitleTablet
        style={isEnableReskin ? { margin: '0 4px' } : {}}
        $display={type === layoutType.list}
      >
        {t('common.storage')}
      </ReskinComponents.TitleTablet>
      <ReskinComponents.TitleTablet
        style={isEnableReskin ? { marginLeft: '-8px' } : {}}
        $display={type === layoutType.list}
      >
        {t('documentPage.lastOpened')}
      </ReskinComponents.TitleTablet>
      <Styled.MobileDisplay>{renderToggleSelection()}</Styled.MobileDisplay>
    </ReskinComponents.Container>
  );
}

DocumentListHeader.propTypes = propTypes;
DocumentListHeader.defaultProps = defaultProps;

export default React.memo(DocumentListHeader);
