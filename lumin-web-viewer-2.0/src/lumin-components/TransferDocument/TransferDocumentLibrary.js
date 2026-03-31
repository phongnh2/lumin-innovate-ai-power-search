// eslint-disable-next-line import/no-unresolved
import { ArrowRightIcon } from '@luminpdf/icons/dist/csr/ArrowRight';
// eslint-disable-next-line import/no-unresolved
import { CaretRightIcon } from '@luminpdf/icons/dist/csr/CaretRight';
// eslint-disable-next-line import/no-unresolved
import { FolderOpenIcon } from '@luminpdf/icons/dist/csr/FolderOpen';
// eslint-disable-next-line import/no-unresolved
import { InfoIcon } from '@luminpdf/icons/dist/csr/Info';
// eslint-disable-next-line import/no-unresolved
import { MagnifyingGlassIcon } from '@luminpdf/icons/dist/csr/MagnifyingGlass';
// eslint-disable-next-line import/no-unresolved
import { UserIcon } from '@luminpdf/icons/dist/csr/User';
// eslint-disable-next-line import/no-unresolved
import { UsersThreeIcon } from '@luminpdf/icons/dist/csr/UsersThree';
import {
  Dialog,
  PlainTooltip as Tooltip,
  TextInput as Input,
  Select,
  Avatar,
  IconButton,
  MenuItemBase,
  Checkbox as CheckboxBase,
  ScrollArea,
  Tabs,
} from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState, useContext, useMemo, useCallback } from 'react';
import { ThemeProvider } from 'styled-components';

import Icomoon from 'lumin-components/Icomoon';
import Loading from 'lumin-components/Loading';
import ModalFooter from 'lumin-components/ModalFooter';
import { useThemeMode } from 'lumin-components/MoveDocumentContainer/hooks/useThemeMode';

import { useTranslation, useAvailablePersonalWorkspace } from 'hooks';

import { folderType } from 'constants/documentConstants';
import { LocationType } from 'constants/locationConstant';
import { Colors } from 'constants/styles';

import * as Styled from './TransferDocumentStyled';

import styles from './TransferDocument.module.scss';

const getSourcesData = ({ t, isAvailablePersonalWorkspace }) =>
  isAvailablePersonalWorkspace
    ? [
        {
          id: folderType.INDIVIDUAL,
          value: folderType.INDIVIDUAL,
          label: t('modalMakeACopy.personalDocuments'),
          icon: <UserIcon size={20} />,
          activeIcon: <UserIcon size={20} />,
        },
        {
          id: folderType.ORGANIZATION,
          value: folderType.ORGANIZATION,
          label: t('modalMakeACopy.circleDocuments'),
          icon: <UsersThreeIcon size={20} />,
          activeIcon: <UsersThreeIcon size={20} />,
        },
      ]
    : [
        {
          id: folderType.ORGANIZATION,
          value: folderType.ORGANIZATION,
          label: t('modalMakeACopy.circleDocuments'),
          icon: <UsersThreeIcon size={20} />,
          activeIcon: <UsersThreeIcon size={20} />,
        },
      ];

const MAX_HEIGHT_EXPAND_LIST = 300;
const MIN_HEIGHT_EXPAND_LIST = 200;

const TransferDocumentContext = React.createContext();

const Container = ({ children, open, initialSource, ...rest }) => {
  const [source, setSource] = useState(initialSource);
  const { theme } = useThemeMode();

  const context = useMemo(
    () => ({
      isLightMode: theme.isLightMode,
      source,
      setSource,
    }),
    [source, theme.isLightMode]
  );

  return (
    <TransferDocumentContext.Provider value={context}>
      <ThemeProvider theme={theme}>
        <Dialog size="md" opened={open} {...rest} classNames={{ root: styles.rootModal, ...rest.classNames }}>
          {children}
        </Dialog>
      </ThemeProvider>
    </TransferDocumentContext.Provider>
  );
};

const Header = ({ children, toolTipProps }) => (
  <div className={styles.header}>
    <h2 className={styles.modalTitle}>{children}</h2>
    {toolTipProps && (
      <Tooltip content={toolTipProps.title} position={toolTipProps.placement}>
        <InfoIcon size={20} />
      </Tooltip>
    )}
  </div>
);

const NameInput = ({ errorMessage, ...rest }) => <Input className={styles.nameInput} {...rest} error={errorMessage} />;

const DropdownSources = ({ children, onChange }) => {
  const { t } = useTranslation();
  const { source, setSource } = useContext(TransferDocumentContext);
  const isAvailablePersonalWorkspace = useAvailablePersonalWorkspace();

  const renderSelectOption = useCallback(
    ({ option }) => (
      <div className={styles.destinationOption}>
        {option.icon}
        {option.label}
      </div>
    ),
    []
  );

  return (
    <div className={styles.sourceWrapper}>
      <span className={styles.label}>{children}</span>
      <Select
        data={getSourcesData({ t, isAvailablePersonalWorkspace })}
        onChange={(newVal) => {
          setSource(newVal);
          onChange(newVal);
        }}
        value={source}
        renderOption={renderSelectOption}
      />
    </div>
  );
};

const BreadCrumbs = ({ breadcrumb: [main, ...rest], onNavigate, search, hideSearch }) => {
  const [showSearch, setShowSearch] = useState(false);
  return (
    <div className={styles.breadcrumbWrapper}>
      {!showSearch ? (
        <>
          <div className={styles.breadcrumbContainer}>
            <h3 className={styles.breadcrumbMainItem} onClick={() => onNavigate(main.refetch)}>
              {main.name}
            </h3>
            {rest.map((item, index) => (
              <div
                className={styles.breadcrumbItemContainer}
                key={index}
                style={{ maxWidth: rest.length > 1 ? '33%' : '66%' }}
              >
                <CaretRightIcon size={16} style={{ margin: '0 8px' }} />
                <div
                  role="button"
                  tabIndex={0}
                  className={styles.breadcrumbItem}
                  onClick={() => onNavigate(item.refetch)}
                  data-last-item={index === rest.length - 1}
                >
                  {item.name}
                </div>
              </div>
            ))}
          </div>
          {!hideSearch && (
            <IconButton onClick={() => setShowSearch(!showSearch)} className={styles.iconSearch}>
              <MagnifyingGlassIcon size={20} />
            </IconButton>
          )}
        </>
      ) : (
        <SearchBar
          onClear={() => setShowSearch(false)}
          value={search.text}
          onChange={search.onChange}
          placeholder={search.placeholder}
        />
      )}
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const CustomDivider = ({ orientation = 'horizontal' }) => (
  <hr className={styles.divider} data-orientation={orientation} />
);

const CustomLoading = () => (
  <div className={styles.loadingWrapper}>
    <Loading normal />
  </div>
);

const AvatarRenderer = ({ avatar }) => {
  if (avatar.type === 'folder') {
    return (
      <div className={styles.folderIconContainer} style={{ backgroundColor: avatar.color }}>
        <FolderOpenIcon size={20} color="white" />
      </div>
    );
  }

  if (avatar.src) {
    return <Avatar size={32} src={avatar.src} variant="default" />;
  }

  return <div className={styles.defaultAvatar}>{avatar.defaultSrc}</div>;
};

AvatarRenderer.propTypes = {
  avatar: PropTypes.shape({
    type: PropTypes.string,
    color: PropTypes.string,
    src: PropTypes.string,
    defaultSrc: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  }).isRequired,
};

const ExpandedList = ({
  disabledValue,
  value,
  onChange,
  onNavigate,
  isBreadcrumbExists = false,
  search,
  expandedList,
  expandedStatus,
  isMultipleFile,
}) => {
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const { expandedAll = true, activeDestinationSource, setActiveDestinationSource } = expandedStatus;

  const getHeader = (title) => {
    if (!title) {
      return null;
    }
    if (!Array.isArray(title)) {
      return !showSearch ? (
        <div className={styles.expandedTitleContainer}>
          <div className={styles.expandedTitle} data-is-breadcrumb-exists={isBreadcrumbExists}>
            {title}
          </div>
          {!isBreadcrumbExists && (
            <IconButton
            component="div"
            role="button"
            tabIndex={0}
            onClick={() => setShowSearch(!showSearch)}
            className={styles.iconSearch}
          >
              <MagnifyingGlassIcon size={20} />
            </IconButton>
          )}
        </div>
      ) : (
        <SearchBar
          onClear={() => setShowSearch(false)}
          value={search.text}
          onChange={search.onChange}
          placeholder={search.placeholder}
        />
      );
    }

    return (
      <Tabs
        className={styles.tabContainer}
        onChange={(value) => setActiveDestinationSource(value)}
        value={String(activeDestinationSource)}
      >
        <Tabs.List grow>
          {title.map((tabItem, i) => {
            const isDisabled = !search.text && !expandedList[i].items.length;
            return (
              <Tabs.Tab key={i} value={String(i)} disabled={isDisabled}>
                {tabItem}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>
    );
  };

  const renderList = ({ items, sourceType, fixed }) =>
    items.length ? (
      <ScrollArea.AutoSize type="hover" mah={MAX_HEIGHT_EXPAND_LIST} mih={MIN_HEIGHT_EXPAND_LIST}>
        {items.map(({ id, avatar, content, extra = {}, ...restProp }, index) => {
          const selected = value === id;
          const disabled = disabledValue === id;
          const textTooltip = isMultipleFile
            ? t('modalMove.tooltipFilesAreAlreadyHere')
            : t('modalMove.tooltipFileIsAlreadyHere');

          return (
            <MenuItemBase
              size="dense"
              key={id}
              onClick={() =>
                !disabled &&
                onChange({
                  id,
                  type: sourceType,
                  name: content,
                  ...restProp,
                })
              }
              disabled={disabled}
              selected={selected}
              data-last-item={index === items.length - 1}
              data-fixed={fixed}
              activated={selected}
              component="div"
              tabIndex={0}
              role="button"
            >
              <Tooltip content={disabled && textTooltip}>
                <div className={styles.expandedItemContainer} data-full-width={!extra.showArrow}>
                  <div className={styles.expandedItemMainContent} data-disabled={disabled}>
                    <AvatarRenderer avatar={avatar} />
                    <p className={styles.text} disabled={disabled}>
                      <Tooltip content={!disabled && content} position="bottom-start">
                        <span>{content}</span>
                      </Tooltip>
                    </p>
                  </div>
                  {extra.showArrow && (
                    <Tooltip content={extra.tooltipText} position="bottom">
                      <IconButton onClick={() => onNavigate(extra.refetch)}>
                        <ArrowRightIcon size={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </Tooltip>
            </MenuItemBase>
          );
        })}
      </ScrollArea.AutoSize>
    ) : (
      <p className={styles.text} data-not-found="true">
        {t('modalMakeACopy.noResult')}
      </p>
    );

  const renderAll = () =>
    expandedList.map(({ title = '', items, sourceType, fixed = false }, index) =>
      !search.text && !items.length ? null : (
        <React.Fragment key={index}>
          <div
            className={styles.expandedListContainer}
            data-is-breadcrumb-exists={isBreadcrumbExists}
            data-fixed={fixed}
            data-one-list-only={fixed && !expandedList[1]?.items.length}
          >
            {getHeader(title)}
            {renderList({ items, sourceType, fixed })}
          </div>
        </React.Fragment>
      )
    );

  const renderSelectedOnly = () => {
    const { items = [], sourceType, fixed } = expandedList[activeDestinationSource];
    const titles = expandedList.map(({ title }) => title);

    return (
      <div className={styles.expandedListContainer} data-is-breadcrumb-exists={isBreadcrumbExists} data-fixed={fixed}>
        {getHeader(titles)}
        {renderList({ items, sourceType, fixed })}
      </div>
    );
  };

  return (
    <>
      {!expandedAll ? renderSelectedOnly() : renderAll()}
      <CustomDivider />
    </>
  );
};

const ExpandedListTemplate = ({
  value,
  user,
  expandedList,
  onChange,
  onNavigate,
  breadcrumb,
  hideSearch,
  hasExpandedList,
}) => {
  const { t } = useTranslation();
  const selectedUser = value === user.id;

  const renderList = () => (
    <>
      <BreadCrumbs
        hideSearch={hideSearch}
        breadcrumb={breadcrumb}
        onNavigate={() => onNavigate({ type: LocationType.ORGANIZATION })}
      />
      {expandedList.length ? (
        <ScrollArea.AutoSize type="hover" mah={MAX_HEIGHT_EXPAND_LIST}>
          {expandedList.map((item, index) => {
            const { id, avatar, content, extra = {} } = item;
            const selectedItem = value === id;

            return (
              <Styled.ExpandedItem
                key={id}
                onClick={() => onChange(item)}
                $isLastItem={index === expandedList.length - 1}
                selected={selectedItem}
              >
                <Styled.ExpandedItemContainer fullWidth={!extra.showArrow} $selected={selectedItem}>
                  <Styled.ExpandedItemMainContent>
                    <Avatar size={32} src={avatar.src} variant={avatar.variant}>
                      {avatar.defaultSrc}
                    </Avatar>

                    <p className={styles.text}>
                      <Tooltip content={content} position="bottom-start">
                        {content}
                      </Tooltip>
                    </p>
                  </Styled.ExpandedItemMainContent>
                  {extra.showArrow && (
                    <Tooltip content={extra.tooltipText} position="bottom">
                      <IconButton
                        onClick={() => onNavigate({ type: LocationType.ORGANIZATION_TEAM, organization: item })}
                      >
                        <ArrowRightIcon size={20} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Styled.ExpandedItemContainer>
              </Styled.ExpandedItem>
            );
          })}
        </ScrollArea.AutoSize>
      ) : (
        <p className={styles.text} data-not-found="true">
          {t('modalMakeACopy.noResult')}
        </p>
      )}
    </>
  );

  return (
    <>
      <Styled.ExpandedTitle>{t('modalMakeACopy.personalTemplates')}</Styled.ExpandedTitle>
      <Styled.ExpandedItem onClick={() => onChange(user)} selected={selectedUser}>
        <Styled.ExpandedItemContainer $selected={selectedUser}>
          <Styled.ExpandedItemMainContent>
            <Avatar size={32} src={user.avatar?.src} variant={user.avatar?.variant}>
              {user.avatar?.defaultSrc}
            </Avatar>

            <p className={styles.text}>
              <Tooltip content={user.content} position="bottom-start">
                <span>{user.content}</span>
              </Tooltip>
            </p>
          </Styled.ExpandedItemMainContent>
        </Styled.ExpandedItemContainer>
      </Styled.ExpandedItem>

      {hasExpandedList && renderList()}

      <CustomDivider />
    </>
  );
};

const ErrorIns = ({ error }) => error && <Styled.ErrorStyled>{error}</Styled.ErrorStyled>;

const GroupButton = ({ submitStatus, onSubmit, onClose, hasError, label }) => (
  <Styled.ButtonGroup>
    <ModalFooter
      onSubmit={onSubmit}
      onCancel={onClose}
      disabled={Boolean(hasError)}
      loading={submitStatus.isSubmitting}
      label={label || submitStatus.title}
    />
  </Styled.ButtonGroup>
);

const SearchBar = ({ placeholder, onClear, onChange, value, autoFocus }) => (
  <Styled.SearchWrapper>
    <Input
      placeholder={placeholder}
      autoFocus={autoFocus}
      value={value}
      onChange={onChange}
      onClear={onClear}
      clearable
      leftSection={<MagnifyingGlassIcon size={20} />}
      size="md"
    />
  </Styled.SearchWrapper>
);

const Checkbox = ({ children, value, onChange }) => (
  <div className={styles.checkboxWrapper}>
    <CheckboxBase size="md" label={children} type="checkbox" checked={value} onChange={onChange} />
  </div>
);

const OrgTextNotification = () => {
  const { t } = useTranslation();
  return (
    <Styled.OrgTextNotificationContainer>
      <Icomoon className="info" size={18} color={Colors.NEUTRAL_100} />
      <Styled.TextNotification>{t('modalMakeACopy.orgTextNotification')}</Styled.TextNotification>
    </Styled.OrgTextNotificationContainer>
  );
};

Container.propTypes = {
  children: PropTypes.any.isRequired,
  open: PropTypes.bool.isRequired,
  initialSource: PropTypes.string.isRequired,
};

Container.defaultProps = {};

Header.propTypes = {
  children: PropTypes.any.isRequired,
  toolTipProps: PropTypes.object,
};

Header.defaultProps = {
  toolTipProps: null,
};

DropdownSources.propTypes = {
  children: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
};

ExpandedList.propTypes = {
  onChange: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  value: PropTypes.string,
  isBreadcrumbExists: PropTypes.bool.isRequired,
  search: PropTypes.object.isRequired,
  disabledValue: PropTypes.string,
  expandedList: PropTypes.array.isRequired,
  expandedStatus: PropTypes.object.isRequired,
  isMultipleFile: PropTypes.bool,
};

ExpandedList.defaultProps = {
  disabledValue: '',
  value: undefined,
  isMultipleFile: false,
};

ExpandedListTemplate.propTypes = {
  value: PropTypes.string,
  user: PropTypes.object.isRequired,
  expandedList: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  breadcrumb: PropTypes.array.isRequired,
  hideSearch: PropTypes.bool,
  hasExpandedList: PropTypes.bool.isRequired,
};

ExpandedListTemplate.defaultProps = {
  value: '',
  hideSearch: false,
};

BreadCrumbs.propTypes = {
  breadcrumb: PropTypes.array.isRequired,
  onNavigate: PropTypes.func.isRequired,
  search: PropTypes.object,
  hideSearch: PropTypes.bool,
};

BreadCrumbs.defaultProps = {
  search: {},
  hideSearch: false,
};

GroupButton.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  submitStatus: PropTypes.object.isRequired,
  hasError: PropTypes.any.isRequired,
  label: PropTypes.string,
};

GroupButton.defaultProps = {
  label: undefined,
};

SearchBar.propTypes = {
  onClear: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
};

SearchBar.defaultProps = {
  onClear: () => {},
  autoFocus: true,
};

ErrorIns.propTypes = {
  error: PropTypes.node,
};

ErrorIns.defaultProps = {
  error: null,
};

Checkbox.propTypes = {
  children: PropTypes.any.isRequired,
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

NameInput.propTypes = {
  errorMessage: PropTypes.string,
};

NameInput.defaultProps = {
  errorMessage: '',
};

export default {
  TransferDocumentContext,
  Container,
  Header,
  NameInput,
  DropdownSources,
  ExpandedList,
  CustomDivider,
  GroupButton,
  BreadCrumbs,
  SearchBar,
  Error: ErrorIns,
  Checkbox,
  OrgTextNotification,
  CustomLoading,
  ExpandedListTemplate,
};
