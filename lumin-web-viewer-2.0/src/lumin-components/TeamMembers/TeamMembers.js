import { withApollo } from '@apollo/client/react/hoc';
import Divider from '@mui/material/Divider';
import Fab from '@mui/material/Fab';
import MenuList from '@mui/material/MenuList';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { compose } from 'redux';

import actions from 'actions';
import selectors from 'selectors';

import OrganizationTeamContext from 'screens/OrganizationTeam/Context';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonIcon from 'lumin-components/Shared/ButtonIcon';
import MenuItem from 'lumin-components/Shared/MenuItem';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import CustomHeader from 'luminComponents/CustomHeader';
import Icomoon from 'luminComponents/Icomoon';
import PopperButton from 'luminComponents/PopperButton';
import TeamMembersList from 'luminComponents/TeamMembersList';

import withRouter from 'HOC/withRouter';

import { teamServices, organizationServices, socketServices as SocketServices } from 'services';

import { toastUtils } from 'utils';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { SOCKET_EMIT } from 'constants/socketConstant';
import { Colors } from 'constants/styles';
import { SOCKET_TYPE, TEAMS_TEXT } from 'constants/teamConstant';

import SearchMemberInput from './components/SearchMemberInput';
import { LIST_MEMBER_TO_SHOW, ROLE } from '../../screens/Teams/TeamConstant';
import { socket } from '../../socket';
import './TeamMembers.scss';

const AddMemberModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/AddMemberModal'));
const TeamInfoModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/TeamInfoModal'));
const TeamTransferModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/TeamTransferModal'));
const EditTeamModal = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'luminComponents/EditTeamModal'));

const { deleteOrganizationTeam } = organizationServices;

const propTypes = {
  openModal: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
  removeTeamById: PropTypes.func,
  currentOrganization: PropTypes.object,
  currentTeam: PropTypes.object,
  t: PropTypes.func,
};

const defaultProps = {
  currentUser: {},
  removeTeamById: () => {},
  currentOrganization: {},
  currentTeam: {},
  t: () => {},
};

class TeamMembers extends React.PureComponent {
  _interval;

  constructor(props) {
    super(props);
    this.state = {
      isOpenEditDialog: false,
      isOpenAddDialog: false,
      isOpenInfoModal: false,
      isOpenTransferModal: false,
      searchText: '',
      inputText: '',
      listToShow: LIST_MEMBER_TO_SHOW.MEMBER,
      hasInputFocused: false,
    };
    this.refetchList = null;
    this.inputRef = React.createRef();
    this.socketService = new SocketServices();
  }

  componentDidMount() {
    window.document.title = `${this.props.currentTeam.name} team - Lumin`;
  }

  componentDidUpdate(prevProps, prevState) {
    const { hasInputFocused, inputText } = this.state;
    const focusChanged = hasInputFocused !== prevState.hasInputFocused;
    const textChanged = inputText !== prevState.inputText;
    if (focusChanged || textChanged) {
      this.onUpdate(() => {
        this.setState({
          inputText: '',
          searchText: '',
        });
      });
    }
  }

  componentWillUnmount() {
    clearTimeout(this._interval);
  }

  onUpdate = (callback) => {
    const { hasInputFocused, inputText } = this.state;
    if (!hasInputFocused && !inputText) {
      callback();
    }
  };

  navigateToTeamList = () => {
    const { currentOrganization, navigate } = this.props;
    const linkTo = `/${ORG_TEXT}/${currentOrganization.data.url}/${TEAMS_TEXT}`;
    navigate(linkTo);
  };

  setRefetchList = (refetchList) => {
    this.refetchList = refetchList;
  };

  _toggleInfoModal = () => {
    this.setState(({ isOpenInfoModal }) => ({
      isOpenInfoModal: !isOpenInfoModal,
    }));
  };

  _toggleTransferModal = () => {
    this.setState(({ isOpenTransferModal }) => ({
      isOpenTransferModal: !isOpenTransferModal,
    }));
  };

  _onTextChanged = (e) => {
    const text = e.target.value;
    this.setState({ inputText: text });
    clearTimeout(this._interval);
    this._interval = setTimeout(() => {
      this.setState({ searchText: text.trim() });
    }, 500);
  };

  _removeTeam = async () => {
    const { removeTeamById, currentOrganization, t } = this.props;
    const { currentTeam } = this.context;
    const teamId = currentTeam._id;
    const { _id: orgId, url: orgUrl } = currentOrganization.data || {};
    const response = await deleteOrganizationTeam(teamId);
    socket.emit(SOCKET_EMIT.DELETE_TEAM, {
      ...response,
      targetOrgId: orgId,
      targetOrgUrl: orgUrl,
      type: SOCKET_TYPE.DELETE_TEAM,
    });
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: t('teamMember.teamHasBeenDeleted'),
    });
    removeTeamById(teamId);
    this.navigateToTeamList();
  };

  leaveOrgTeam = async () => {
    const { currentOrganization, currentUser, navigate, removeTeamById, t } = this.props;
    const {
      currentTeam: { _id: teamId },
    } = this.context;
    await teamServices.leaveOrgTeam({ teamId });
    removeTeamById(teamId);
    this.socketService.userLeaveTeam({ teamId, orgId: currentOrganization.data?._id, userId: currentUser._id });
    toastUtils.openToastMulti({
      type: ModalTypes.SUCCESS,
      message: t('teamMember.leaveTeamSuccessfully'),
    });
    navigate(`/${ORG_TEXT}/${currentOrganization.data.url}/${TEAMS_TEXT}`);
  };

  _toggleEditDialog = () => {
    this.setState(({ isOpenEditDialog }) => ({ isOpenEditDialog: !isOpenEditDialog }));
  };

  _closeEditDialog = () => {
    this.setState({ isOpenEditDialog: false });
  };

  _toggleAddMemberDialog = () => {
    this.setState((state) => ({
      isOpenAddDialog: !state.isOpenAddDialog,
    }));
  };

  _confirm = ({ type, onConfirm }) => {
    const { openModal, t } = this.props;
    const { currentTeam } = this.context;

    const text = {
      leave1: t('teamMember.leaveTeam1'),
      delete1: t('teamMember.deleteTeam1'),
      leaveMessage: (
        <Trans i18nKey="teamMember.leaveTeamMessage" components={{ b: <b /> }} values={{ name: currentTeam.name }} />
      ),
    };

    const title = type === 'LEAVE_TEAM' ? text.leave1 : text.delete1;
    const modalSettings = {
      type: ModalTypes.WARNING,
      title,
      message: text.leaveMessage,
      confirmButtonTitle: type === 'LEAVE_TEAM' ? t('common.leave') : t('common.delete'),
      onCancel: () => {},
      onConfirm: () => onConfirm(),
      className: 'MaterialDialog__custom',
    };
    openModal(modalSettings);
  };

  clickLeaveTeam = () => {
    const { currentUser, openModal, t } = this.props;
    const { currentTeam } = this.context;
    const isOwner = currentUser._id === currentTeam.owner._id;
    if (isOwner) {
      this._toggleTransferModal();
      return;
    }

    const text = {
      leave1: t('teamMember.leaveTeam1'),
      leaveTeamMessage1: (
        <Trans i18nKey="teamMember.leaveTeamMessage1" components={{ b: <b /> }} values={{ name: currentTeam.name }} />
      ),
    };

    const modalSettings = {
      type: ModalTypes.WARNING,
      title: text.leave1,
      confirmButtonTitle: t('common.leave'),
      message: text.leaveTeamMessage1,
      onCancel: () => {},
      onConfirm: this.leaveOrgTeam,
    };
    openModal(modalSettings);
  };

  _renderPopperContent = () => {
    const { currentUser, t } = this.props;
    const { currentTeam } = this.context;
    const isOwner = currentUser._id === currentTeam.owner._id;

    const text = {
      info: t('teamMember.teamInfo'),
      edit: t('teamMember.editTeam'),
      leave: t('teamMember.leaveTeam'),
      delete: t('teamMember.deleteTeam'),
    };

    return (
      <MenuList>
        <MenuItem key="team_info" onClick={this._toggleInfoModal}>
          <Icomoon className="file-info" size={18} color={Colors.NEUTRAL_80} />
          {text.info}
        </MenuItem>
        <Divider />
        {currentTeam.roleOfUser !== ROLE.MEMBER.toLowerCase() && (
          <MenuItem key="edit_team" onClick={this._toggleEditDialog}>
            <Icomoon className="edit-mode" size={18} color={Colors.NEUTRAL_80} />
            {text.edit}
          </MenuItem>
        )}
        {currentTeam.totalMembers > 1 && (
          <MenuItem onClick={this.clickLeaveTeam} key="leave_team">
            <Icomoon className="signout" size={18} color={Colors.NEUTRAL_80} /> {text.leave}
          </MenuItem>
        )}
        {isOwner && (
          <div>
            <Divider />
            <MenuItem
              key="delete_team"
              onClick={() => {
                this._confirm({
                  type: 'DELETE_TEAM',
                  onConfirm: this._removeTeam,
                });
              }}
            >
              <Icomoon className="trash" size={18} color={Colors.NEUTRAL_80} /> {text.delete}
            </MenuItem>
          </div>
        )}
      </MenuList>
    );
  };

  openSearchInput = () => {
    this.setState({
      hasInputFocused: true,
    });
  };

  onInputTransitionEnd = (e) => {
    const { hasInputFocused } = this.state;
    const hasWidthChanged = e.propertyName === 'width';
    if (hasInputFocused && hasWidthChanged) {
      this.inputRef.current.focus();
    }
  };

  onInputBlur = () => {
    this.setState({ hasInputFocused: false });
  };

  onInputFocused = () => {
    this.setState({ hasInputFocused: true });
  };

  renderScreen() {
    const {
      isOpenEditDialog,
      isOpenAddDialog,
      isOpenInfoModal,
      isOpenTransferModal,
      searchText,
      inputText,
      listToShow,
      hasInputFocused,
    } = this.state;
    const { t } = this.props;
    const { currentTeam, refetchTeam, updateTeam } = this.context;
    const shouldInputExpand = Boolean(hasInputFocused || inputText);

    return (
      <>
        <CustomHeader noIndex />
        <div className="TeamMembers">
          <div className="TeamMembers__container">
            <div className="TeamMembers__edit">
              <div className="TeamMembers__search">
                <h2
                  className={classNames('TeamMembers__title', {
                    'TeamMembers__title--disabled': shouldInputExpand,
                  })}
                >
                  {t('teamMember.addedMembers')}
                </h2>
                <SearchMemberInput
                  onChange={this._onTextChanged}
                  value={inputText}
                  isOpen={shouldInputExpand}
                  onTransitionEnd={this.onInputTransitionEnd}
                  onBlur={this.onInputBlur}
                  onFocus={this.onInputFocused}
                  ref={this.inputRef}
                />
              </div>

              <div>
                {currentTeam.roleOfUser !== ROLE.MEMBER.toLowerCase() && (
                  <ButtonMaterial className="hide-in-mobile" size={ButtonSize.LG} onClick={this._toggleAddMemberDialog}>
                    <Icomoon className="add-member" size={20} style={{ marginRight: 8 }} color={Colors.WHITE} />
                    {t('teamMember.addMember')}
                  </ButtonMaterial>
                )}
                <ButtonIcon
                  icon="search"
                  iconSize={20}
                  iconColor={Colors.NEUTRAL_60}
                  size={44}
                  className="TeamMembers__search-btn"
                  onClick={this.openSearchInput}
                />
                <PopperButton
                  classes="TeamMembers__more"
                  renderPopperContent={this._renderPopperContent}
                  popperProps={{
                    placement: 'bottom-end',
                    classes: 'TeamMembers__popper',
                    parentOverflow: 'viewport',
                  }}
                >
                  <Icomoon className="more-v" color={Colors.NEUTRAL_60} />
                </PopperButton>
              </div>
            </div>
            <TeamMembersList
              listToShow={listToShow}
              team={currentTeam}
              searchText={searchText}
              setRefetchList={this.setRefetchList}
              refetchTeam={refetchTeam}
            />
          </div>

          {currentTeam.roleOfUser !== ROLE.MEMBER.toLowerCase() && (
            <Fab
              onClick={this._toggleAddMemberDialog}
              className="TeamMembers__add_fab active hide-in-desktop hide-in-tablet"
              aria-label="Add"
            >
              <Icomoon className="add" size={12} />
            </Fab>
          )}
          {isOpenEditDialog && (
            <EditTeamModal
              team={currentTeam}
              open={isOpenEditDialog}
              onClose={this._closeEditDialog}
              onSaved={updateTeam}
            />
          )}
          {isOpenAddDialog && (
            <AddMemberModal team={currentTeam} onClose={this._toggleAddMemberDialog} onSaved={this.refetchList} />
          )}
          {isOpenInfoModal && <TeamInfoModal open team={currentTeam} onClose={this._toggleInfoModal} />}
          {isOpenTransferModal && <TeamTransferModal team={currentTeam} open onClose={this._toggleTransferModal} />}
        </div>
      </>
    );
  }

  render() {
    return this.renderScreen();
  }
}

const mapStateToProps = (state) => ({
  currentUser: selectors.getCurrentUser(state),
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
  removeTeamById: (teamId) => dispatch(actions.removeTeamById(teamId)),
  openErrorModal: () => dispatch(actions.openErrorModal()),
});

TeamMembers.propTypes = propTypes;
TeamMembers.defaultProps = defaultProps;
TeamMembers.contextType = OrganizationTeamContext;

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
  withRouter,
  withTranslation()
)(TeamMembers);
