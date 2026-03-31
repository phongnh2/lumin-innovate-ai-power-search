/* eslint-disable class-methods-use-this */
import { ClickAwayListener } from '@mui/material';
import classNames from 'classnames';
import Downshift from 'downshift';
import { debounce, reject } from 'lodash';
import {
  TextInput,
  Icomoon as KiwiIcomoon,
  Popover,
  PopoverTarget,
  PopoverDropdown,
  CircularProgress,
  Menu,
  Button as KiwiButton,
  Text,
} from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import Scrollbars from 'react-custom-scrollbars-2';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { SearchResultItem as SearchResultItemReskin } from '@web-new-ui/components/ShareModal';

import selectors from 'selectors';

import CircularLoading from 'lumin-components/CircularLoading';
import SharePermissionPopover from 'lumin-components/ShareListItem/components/SharePermissionPopover';
import Icomoon from 'luminComponents/Icomoon';
import MaterialPopper from 'luminComponents/MaterialPopper';
import MemberListItem from 'luminComponents/MemberListItem';
import SearchResultItem from 'luminComponents/SearchResultItem';

import { userServices } from 'services';

import { getDocumentSharingPermission } from 'utils';
import errorUtils from 'utils/error';

import { DocumentRole, DOCUMENT_TYPE } from 'constants/documentConstants';
import {
  ErrorCode,
  UserStatus,
  EntitySearchType,
  DEBOUNCED_SEARCH_TIME,
  SearchUserStatus,
  THEME_MODE,
} from 'constants/lumin-common';
import { Colors } from 'constants/styles';

import UserTag from './components/UserTag';
import './AddShareMemberInput.scss';

const propTypes = {
  handleAddUserTag: PropTypes.func,
  setShareMessage: PropTypes.func,
  handleChangeUserTagPermission: PropTypes.func,
  userTags: PropTypes.array,
  pendingUserList: PropTypes.array,
  members: PropTypes.array,
  client: PropTypes.object,
  handleAddPendingUserTag: PropTypes.func,
  documentId: PropTypes.string,
  searchType: PropTypes.oneOf(Object.values(DOCUMENT_TYPE)),
  handleSetMessage: PropTypes.func,
  handleRemoveUserTag: PropTypes.func,
  isDisabledInput: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  currentUser: PropTypes.object.isRequired,
  shareMessage: PropTypes.bool,
  t: PropTypes.func,
  isReskin: PropTypes.bool,
  autoFocus: PropTypes.bool,
};

const defaultProps = {
  handleAddUserTag: () => {},
  handleAddPendingUserTag: () => {},
  setShareMessage: () => {},
  handleChangeUserTagPermission: () => {},
  userTags: [],
  members: [],
  client: {},
  pendingUserList: [],
  documentId: '',
  searchType: DOCUMENT_TYPE.PERSONAL,
  handleSetMessage: () => {},
  handleRemoveUserTag: () => {},
  isDisabledInput: false,
  themeMode: THEME_MODE.LIGHT,
  shareMessage: false,
  t: () => {},
  isReskin: false,
  autoFocus: false,
};

class AddShareMemberInput extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      items: [],
      popper: false,
      selectedPermission: DocumentRole.SPECTATOR,
      isOpen: false,
      error: '',
      cursor: -1,
      searching: false,
      popperWidth: 0,
      scrollToEndRef: null,
    };
    this.inputRef = React.createRef();
    this.popperAnchor = React.createRef();
    this.optionAnchor = React.createRef();
    this.debounceFindUser = debounce(this.findUser, DEBOUNCED_SEARCH_TIME);
    this.scrollTimeout = React.createRef();
    this.mounted = false;
    this.autoFocusInput = props.autoFocus;
    this.isFirstClickOnInput = true;
  }

  componentDidMount() {
    const { inputValue } = this.state;
    this.findUser(inputValue);
    this.mounted = true;
  }

  componentDidUpdate(prevProps) {
    this.refetchSearchUser(prevProps);
  }

  componentWillUnmount() {
    clearTimeout(this.scrollTimeout);
    this.mounted = false;
  }

  refetchSearchUser = (prevProps) => {
    const { inputValue } = this.state;
    const { userTags } = this.props;
    if (prevProps.userTags.length !== userTags.length) {
      this.findUser(inputValue);
    }
  };

  handleKeyDown = (event) => {
    const { userTags, setShareMessage } = this.props;
    const { inputValue, items } = this.state;
    if (userTags.length && !inputValue.length && event.key === 'Backspace') {
      const lastElement = Array.from(userTags).pop();
      this.handleDelete(lastElement);
      if (userTags.length < 2) {
        setShareMessage(false);
      }
    }

    if (items.length > 0) {
      this.handleKeyAction(event);
    }
  };

  isValidStatus = (status) => [SearchUserStatus.USER_VALID, SearchUserStatus.USER_ADDED].includes(status);

  handleVerticalDirectionKey = ({ event, items }) => {
    if (items.some(({ email }) => this.isMe(email))) {
      return;
    }
    switch (event.key) {
      case 'ArrowUp': {
        this.setState((prevState) => ({
          cursor: prevState.cursor > 0 ? prevState.cursor - 1 : items.length - 1,
        }));
        break;
      }
      case 'ArrowDown': {
        this.setState((prevState) => ({
          cursor: prevState.cursor < items.length - 1 ? prevState.cursor + 1 : 0,
        }));
        break;
      }
      default:
        break;
    }
  };

  handleEscKey = (e) => {
    if (this.isPopoverOpen() && e.key === 'Escape') {
      e.stopPropagation();
      this.setState({
        isOpen: false,
      });
    }
  };

  handleKeyAction = (event) => {
    const { cursor, items, searching } = this.state;
    this.handleVerticalDirectionKey({ event, items });
    this.handleEscKey(event);
    const isValidUser = this.isValidStatus(items[cursor]?.status);
    const canSubmitByEnter =
      cursor > -1 && event.key === 'Enter' && (isValidUser || this.isPendingUser(items[cursor])) && !searching;
    if (canSubmitByEnter) {
      this.handleOnClick(items[cursor]);
      this.setState({ isOpen: false, cursor: -1 });
    }
  };

  hasEmailIncluded = (_email) => (target) => target.email === _email;

  isPendingUser = (_user) => !_user._id;

  isUnavailableUser = (_name) => UserStatus.UNAVAILABLE === _name;

  isRestrictedUser = (_status) => SearchUserStatus.USER_RESTRICTED === _status;

  handleOnClick = (item) => {
    const { name, email } = item;
    const { userTags, handleAddUserTag, handleAddPendingUserTag, setShareMessage, pendingUserList } = this.props;
    const isUserAdded = [...userTags].some(this.hasEmailIncluded(email));
    if (this.isUnavailableUser(name) || isUserAdded || this.isMe(email)) {
      return;
    }
    const newSelectedItemUserTag = [...userTags, item];
    const newSelectedItemPendingUserTag = [...pendingUserList, this.isPendingUser(item) && item].filter(Boolean);
    this.setState({
      inputValue: '',
    });
    handleAddUserTag(newSelectedItemUserTag, this.handleScrollContent);
    handleAddPendingUserTag(newSelectedItemPendingUserTag, this.handleScrollContent);
    this.removeMemberAfterAdding(email);
    setShareMessage(true);
    this.onClickOutsideInput();
  };

  removeMemberAfterAdding = (email) => {
    this.setState((prevState) => ({ items: reject(prevState.items, ['email', email]) }));
  };

  handleScrollContent = () => {
    const { scrollToEndRef } = this.state;
    this.scrollTimeout = setTimeout(() => {
      scrollToEndRef?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }, 0);
  };

  filterByEmail = (email) => (target) => target.email !== email;

  handleDelete = (item) => {
    const { userTags, pendingUserList, setShareMessage, handleAddPendingUserTag, handleRemoveUserTag } = this.props;
    const { inputValue } = this.state;
    handleRemoveUserTag(userTags.filter(this.filterByEmail(item.email)));

    handleAddPendingUserTag(pendingUserList.filter(this.filterByEmail(item.email)));
    if (userTags.length < 2 && !inputValue) {
      setShareMessage(false);
    }
  };

  openPermissionDropdown = () => this.setState({ popper: true, isOpen: false });

  closePermissionDropdown = () => this.setState({ popper: false });

  selectPermission = (role) => {
    this.setState({
      selectedPermission: role,
      popper: false,
    });
    this.props.handleChangeUserTagPermission(role);
  };

  renderPermissions = () => {
    const { selectedPermission, popper } = this.state;
    const { t, themeMode, isReskin } = this.props;
    const permissions = getDocumentSharingPermission(t);

    if (isReskin) {
      return (
        <div className="ACInput__permission-container ACInputReskin">
          <Text type="body" size="md">
            {t('modalShare.peopleInvited')}
          </Text>
          <Menu
            returnFocus
            width={180}
            ComponentTarget={
              <KiwiButton
                colorType="system"
                variant="text"
                size="md"
                endIcon={<KiwiIcomoon type="chevron-down-md" size="sm" />}
                data-cy="share_permision_selector"
              >
                {permissions[selectedPermission].text}
              </KiwiButton>
            }
            opened={popper}
            onClose={this.closePermissionDropdown}
            onOpen={this.openPermissionDropdown}
            position="bottom-start"
          >
            <SharePermissionPopover
              value={selectedPermission}
              closePopper={this.closePermissionDropdown}
              handleChangePermission={this.selectPermission}
              canDelete={false}
            />
          </Menu>
        </div>
      );
    }

    return (
      <div className="ACInput__permission-container">
        <span className="ACInput__text">{t('modalShare.peopleInvited')} </span>
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="ACInput__permission" onClick={this.openPermissionDropdown} ref={this.popperAnchor}>
          <span>{permissions[selectedPermission].text}</span>
          <Icomoon className="dropdown" color={Colors.PRIMARY_80} size={10} />
        </div>
        {popper && (
          <MaterialPopper
            open
            classes={`theme-${themeMode}`}
            anchorEl={this.popperAnchor.current}
            handleClose={this.closePermissionDropdown}
            placement="bottom"
            parentOverflow="viewport"
            disablePortal={false}
          >
            <SharePermissionPopover
              value={selectedPermission}
              closePopper={this.closePermissionDropdown}
              handleChangePermission={this.selectPermission}
              canDelete={false}
            />
          </MaterialPopper>
        )}
      </div>
    );
  };

  handleChangeInput = (inputValue) => {
    this.setState({ isOpen: true, error: '' });
    this.debounceFindUser(inputValue);
  };

  handleApiError = (error, { inputValue = '' }) => {
    const { code: errorCode } = errorUtils.extractGqlError(error);
    if (errorCode === ErrorCode.User.UNAVAILABLE_USER) {
      this.setState({
        items: [
          {
            id: '',
            email: inputValue,
            name: UserStatus.UNAVAILABLE,
            avatarRemoteId: '',
            isAdded: true,
            status: SearchUserStatus.USER_UNAVAILABLE,
          },
        ],
      });
    } else {
      this.setState({ isOpen: false, cursor: -1 });
    }
  };

  injectDataToResults = (user) => ({
    ...user,
    disabled: user.status !== SearchUserStatus.USER_VALID,
  });

  filterAddedMemberList = (user) => this.props.userTags.every((tag) => tag.email !== user.email);

  getId = (target) => target._id;

  findUser = async (inputValue) => {
    const { documentId, userTags } = this.props;
    try {
      this.setState({ searching: true });
      const results = await userServices.findUser({
        searchKey: inputValue,
        targetId: documentId,
        targetType: EntitySearchType.DOCUMENT,
        excludeUserIds: userTags.map(this.getId).filter(Boolean),
      });
      if (this.mounted) {
        this.setState({
          items: results.filter(this.filterAddedMemberList).map(this.injectDataToResults),
        });
      }
    } catch (err) {
      this.handleApiError(err, { inputValue });
    } finally {
      if (this.mounted) {
        this.setState({ searching: false });
      }
    }
  };

  getInvalidStatus = (status) =>
    [SearchUserStatus.USER_DELETING, SearchUserStatus.USER_UNAVAILABLE, SearchUserStatus.USER_RESTRICTED].find(
      (_status) => status === _status
    );

  renderSearchResults = ({ item, index, getItemProps }) => {
    const { cursor } = this.state;
    const { isReskin } = this.props;

    if (isReskin) {
      return (
        <SearchResultItemReskin item={item} selected={cursor === index} onClick={() => this.handleOnClick(item)} />
      );
    }

    if (this.isPendingUser(item) || this.isUnavailableUser(item.status)) {
      return (
        <SearchResultItem.PendingUserInfo
          email={item.email}
          disabled={this.isUnavailableUser(item.name) || this.isRestrictedUser(item.status)}
          selected={cursor === index}
          onClick={() => this.handleOnClick(item)}
          invalidStatus={this.getInvalidStatus(item.status)}
        />
      );
    }
    if (
      [SearchUserStatus.USER_DELETING, SearchUserStatus.USER_UNALLOWED, SearchUserStatus.USER_RESTRICTED].includes(
        item.status
      )
    ) {
      return (
        <SearchResultItem.UserInfo
          email={item.email}
          name={item.name}
          avatarRemoteId={item.avatarRemoteId}
          disabled
          unallowed={item.status === SearchUserStatus.USER_UNALLOWED}
          selected={cursor === index}
          invalidStatus={this.getInvalidStatus(item.status)}
        />
      );
    }
    return this.renderSuggestion({
      item,
      index,
      itemProps: getItemProps({ item: item.email }),
    });
  };

  renderContent = ({ getItemProps }) => {
    const { items } = this.state;
    const { isReskin } = this.props;
    return (
      <div className={classNames('ACInput__options', { ACInputReskin: isReskin && Boolean(items.length) })}>
        {items.map((item, index) => (
          <React.Fragment key={index}>{this.renderSearchResults({ item, index, getItemProps })}</React.Fragment>
        ))}
      </div>
    );
  };

  onInputValueChange = (inputValue) => {
    const { setShareMessage, userTags, handleSetMessage } = this.props;
    handleSetMessage('');
    setShareMessage(userTags.length > 0 || !!inputValue);
    this.setState({
      inputValue,
      error: '',
      isOpen: false,
      cursor: -1,
    });
    this.handleChangeInput(inputValue);
  };

  renderInput = (props) => {
    const { inputValue } = this.state;
    const { isDisabledInput } = this.props;
    const { InputProps, inputProps, ...other } = props;
    // eslint-disable-next-line unused-imports/no-unused-vars
    const { value, ...obj } = inputProps;

    const handleFirstClickOnInput = () => {
      if (this.isFirstClickOnInput && this.inputRef.current === document.activeElement) {
        this.isFirstClickOnInput = false;
        this.setState({ isOpen: true, cursor: -1 });
      }
    };

    return (
      <div>
        <TextInput
          {...InputProps}
          {...other}
          {...obj}
          type="search"
          size="lg"
          leftSection={<KiwiIcomoon type="search-lg" size="lg" />}
          clearable={false}
          ref={this.inputRef}
          autoFocus={this.autoFocusInput}
          onClick={handleFirstClickOnInput}
          name="search-member"
          className="ACInput__root"
          value={inputValue}
          disabled={isDisabledInput}
          data-cy="share_member_input"
        />
      </div>
    );
  };

  isMe = (email) => email === this.props.currentUser.email;

  renderSuggestion = (suggestionProps) => {
    const { item, index } = suggestionProps;
    const { cursor } = this.state;
    const { t } = this.props;
    return (
      <MemberListItem
        member={{ user: item }}
        active={index === cursor}
        hover
        disabled={this.isMe(item.email)}
        onClick={() => this.handleOnClick(item)}
        key={item._id}
        rightElement={
          this.isMe(item.email) && (
            <div className="ACInput__item-status">
              <span>{t('common.you')}</span>
            </div>
          )
        }
      />
    );
  };

  onInputFocus = () => {
    if (this.autoFocusInput) {
      this.autoFocusInput = false;
      return;
    }
    this.setState({ isOpen: true, cursor: -1 });
  };

  onClickOutsideInput = () => {
    this.setState({ isOpen: false, cursor: -1 });
  };

  setInputContainerRef = (element) => {
    if (element) {
      const { width } = element.getBoundingClientRect();
      this.setState({ popperWidth: width });
    }
  };

  isPopoverOpen = () => {
    const { isOpen, items } = this.state;
    const { isDisabledInput } = this.props;
    return isOpen && Boolean(items.length) && !isDisabledInput;
  };

  render() {
    const { error, searching, popperWidth } = this.state;
    const { userTags, pendingUserList, themeMode, shareMessage, t, isReskin } = this.props;
    const hasBorderClass = userTags.length > 0;
    const showTagList = hasBorderClass && shareMessage;

    return (
      <>
        <ClickAwayListener onClickAway={this.onClickOutsideInput}>
          <div ref={this.optionAnchor}>
            <Downshift id="downshift-multiple" selectedItem={userTags} isOpen={this.isPopoverOpen()}>
              {({ getInputProps, getItemProps, getLabelProps, isOpen }) => {
                const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
                  onKeyDown: this.handleKeyDown,
                  placeholder: t('modalShare.enterEmailAddres'),
                  onFocus: () => this.onInputFocus(),
                });
                if (isReskin) {
                  return (
                    <div>
                      <div
                        ref={this.setInputContainerRef}
                        className={classNames('ACInput ACInput__select ACInputReskin', {
                          error: Boolean(error),
                          noEmptyTagList: showTagList,
                        })}
                      >
                        <div className="ACInput__searchContainer">
                          {showTagList && (
                            <div
                              className={classNames(
                                'ACInput__chipWrapper custom-scrollbar custom-scrollbar--hide-thumb',
                                {
                                  'ACInput__chipWrapper--border': hasBorderClass,
                                }
                              )}
                            >
                              {userTags.map((tag) => (
                                <UserTag
                                  tag={tag}
                                  key={tag.email}
                                  pendingUserList={pendingUserList}
                                  handleDelete={this.handleDelete}
                                  hasEmailIncluded={this.hasEmailIncluded}
                                />
                              ))}
                              <div ref={(ref) => this.setState({ scrollToEndRef: ref })} />
                            </div>
                          )}
                          <Popover
                            opened={isOpen}
                            onClose={() => this.setState({ isOpen: false })}
                            transitionProps={{ transition: 'pop' }}
                            offset={6}
                          >
                            <PopoverTarget>
                              {this.renderInput({
                                InputProps: {
                                  onBlur,
                                  onChange: (event) => {
                                    onChange(event);
                                    this.onInputValueChange(event.target.value);
                                  },
                                  onFocus,
                                },
                                inputProps,
                              })}
                            </PopoverTarget>
                            <PopoverDropdown
                              paddingVariant="none"
                              style={{
                                width: popperWidth,
                              }}
                            >
                              <div style={{ position: 'relative' }}>
                                <Scrollbars
                                  autoHide
                                  autoHeight
                                  autoHeightMax={400}
                                  className={classNames('ACInputReskin ACInput__popper__scroll', { searching })}
                                >
                                  {this.renderContent({ getItemProps })}
                                </Scrollbars>
                                {searching && (
                                  <div className="ShareModal__loading">
                                    <CircularProgress size="sm" />
                                  </div>
                                )}
                              </div>
                            </PopoverDropdown>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <div>
                    <div
                      ref={this.setInputContainerRef}
                      className={classNames('ACInput ACInput__select', {
                        error: Boolean(error),
                      })}
                    >
                      <div className="ACInput__searchContainer">
                        <Icomoon className="search" size={16} style={{ zIndex: 2 }} />
                        {showTagList && (
                          <div
                            className={classNames(
                              'ACInput__chipWrapper custom-scrollbar custom-scrollbar--hide-thumb',
                              {
                                'ACInput__chipWrapper--border': hasBorderClass,
                              }
                            )}
                          >
                            {userTags.map((tag) => (
                              <UserTag
                                tag={tag}
                                key={tag.email}
                                pendingUserList={pendingUserList}
                                handleDelete={this.handleDelete}
                                hasEmailIncluded={this.hasEmailIncluded}
                              />
                            ))}
                            <div ref={(ref) => this.setState({ scrollToEndRef: ref })} />
                          </div>
                        )}
                        {this.renderInput({
                          fullWidth: true,
                          InputLabelProps: getLabelProps(),
                          InputProps: {
                            onBlur,
                            onChange: (event) => {
                              onChange(event);
                              this.onInputValueChange(event.target.value);
                            },
                            onFocus,
                          },
                          inputProps,
                        })}
                      </div>
                      {isOpen && (
                        <MaterialPopper
                          open
                          anchorEl={this.optionAnchor.current}
                          handleClose={() => this.setState({ isOpen: false })}
                          disableClickAway
                          placement="bottom-start"
                          classes={`ACInput__popper__options theme-${themeMode}`}
                          parentOverflow="viewport"
                          disablePortal={false}
                          style={{
                            width: popperWidth,
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <Scrollbars
                              autoHide
                              autoHeight
                              style={{
                                opacity: searching ? 0.5 : 1,
                                pointerEvents: searching ? 'none' : 'all',
                              }}
                              autoHeightMax={400}
                              className="ACInput__popper__scroll"
                            >
                              {this.renderContent({ getItemProps })}
                            </Scrollbars>
                            {searching && <CircularLoading className="ShareModal__loading" size={24} />}
                          </div>
                        </MaterialPopper>
                      )}
                    </div>
                    <p className="ACInput__errorMessage">{error}</p>
                  </div>
                );
              }}
            </Downshift>
          </div>
        </ClickAwayListener>
        {showTagList && this.renderPermissions()}
      </>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
});

AddShareMemberInput.propTypes = propTypes;
AddShareMemberInput.defaultProps = defaultProps;

export default compose(connect(mapStateToProps), withTranslation())(AddShareMemberInput);
