import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import RadioGroup from '@mui/material/RadioGroup';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { compose } from 'redux';

import { SEARCH_MEMBERS } from 'graphQL/TeamGraph';

import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Loading from 'lumin-components/Loading';
import Input from 'lumin-components/Shared/Input';
import Radio from 'lumin-components/Shared/Radio';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';
import InfiniteScroll from 'luminComponents/InfiniteScroll';
import MemberListItem from 'luminComponents/MemberListItem';

import withTabletMatch from 'HOC/withTabletMatch';

import { teamServices, socketServices as SocketServices } from 'services';

import { errorUtils, toastUtils } from 'utils';

import { ModalTypes } from 'constants/lumin-common';
import { ORG_TEXT } from 'constants/organizationConstants';
import { Colors } from 'constants/styles';
import './TeamTransferModal.scss';
import { TEAMS_TEXT } from 'constants/teamConstant';

const StyledFormControlLabel = withStyles({
  root: {
    margin: 0,
    display: 'flex',
    width: '100%',
    padding: '0 8px',
    borderRadius: '8px',
    transition: 'all 0.25s ease',
    overflow: 'hidden',
    '&:hover': {
      background: Colors.NEUTRAL_10,
    },
  },
  label: {
    overflow: 'hidden',
  },
})(FormControlLabel);

class TeamTransferModal extends React.PureComponent {
  _interval;

  _isMounted = false;

  constructor(props) {
    super(props);
    this.state = {
      selectedId: '',
      inputText: '',
      error: '',
      total: 0,
      users: [],
      cursor: '',
      loading: false,
      searching: false,
    };
    this._onTextChanged = this._onTextChanged.bind(this);
    this._onRadioChanged = this._onRadioChanged.bind(this);
    this._onSave = this._onSave.bind(this);
    this._loadMore = this._loadMore.bind(this);
    this._searchMembers = this._searchMembers.bind(this);
    this.socketService = new SocketServices();
  }

  componentDidMount() {
    this._searchMembers('');
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  async onTransferOrgTeam() {
    const { team, currentUser, onSaved, navigate, currentOrganization, t } = this.props;
    const { _id: currentUserId } = currentUser;

    const { selectedId } = this.state;
    const { _id: teamId } = team;
    const {
      data: { url },
    } = currentOrganization;
    this.setState({ loading: true });
    try {
      await teamServices.transferTeamOwnership(teamId, selectedId);
      await teamServices.leaveOrgTeam({ teamId });
      this._isMounted && this.setState({ inputText: '', selectedId: '', cursor: '' });
      this.socketService
        .changeTeamRole({ teamId, userId: currentUserId, role: 'owner' })
        .userLeaveTeam({ teamId, userId: currentUserId });
      onSaved();
      toastUtils.openToastMulti({
        type: ModalTypes.SUCCESS,
        message: t('teamMember.leaveTeamSuccessfully'),
      });
      navigate(`/${ORG_TEXT}/${url}/${TEAMS_TEXT}`);
    } catch (err) {
      this.setState({ loading: false });
    }
  }

  _onTextChanged(e) {
    const text = e.target.value;
    this.setState({ inputText: text });
    clearTimeout(this._interval);
    this._interval = setTimeout(() => {
      this.setState({ cursor: '', users: [] }, () => {
        this._searchMembers(text);
      });
    }, 500);
  }

  _onRadioChanged(e) {
    this.setState({ selectedId: e.target.value });
  }

  _onSave() {
    this.onTransferOrgTeam();
  }

  _loadMore() {
    const { searchText } = this.state;
    this._searchMembers(searchText);
  }

  async _searchMembers(searchText) {
    const { team, currentUser, t } = this.props;
    const { cursor } = this.state;
    const { _id: userId } = currentUser;
    try {
      this.setState({ searching: true });
      const response = await this.props.client.query({
        query: SEARCH_MEMBERS,
        fetchPolicy: 'no-cache',
        variables: {
          teamId: team._id,
          userQueryInput: {
            notUserId: userId,
            searchText,
          },
          cursor,
        },
      });
      this.setState({ searching: false });
      const { members, membersCount } = response.data.team;
      if (members.length === 0) return;
      this.setState(() => ({
        users: [...members],
        total: membersCount,
        cursor: members[members.length - 1]._id,
      }));
    } catch (error) {
      const { code } = errorUtils.extractGqlError(error);
      errorUtils.handleCommonError({ errorCode: code, t });
    }
  }

  _renderMemberList() {
    const { isTabletUp } = this.props;
    const { total, users, fetchMore, searching } = this.state;
    return (
      <div className="TeamTransferModal__content__members">
        <InfiniteScroll
          className="TeamTransferModal__scrollMembers"
          autoHeight
          autoHeightMax={isTabletUp ? 282 : 192}
          autoHeightMin={isTabletUp ? 282 : 192}
          hasNextPage={users.length < total}
          onLoadMore={() => {
            this._loadMore(users, fetchMore);
          }}
        >
          {!users.length && searching ? (
            <Loading normal containerStyle={{ margin: '32px 0' }} />
          ) : (
            <RadioGroup onChange={this._onRadioChanged}>
              {users.map((user) => (
                <div key={user._id} className="TeamTransferModal__content__members__item">
                  <StyledFormControlLabel
                    value={user._id}
                    control={<Radio />}
                    label={<MemberListItem member={{ user }} />}
                  />
                </div>
              ))}
            </RadioGroup>
          )}
        </InfiniteScroll>
      </div>
    );
  }

  render() {
    const { open, onClose, team, t } = this.props;
    const { error, inputText, selectedId, loading } = this.state;
    const message = (
      <Trans
        i18nKey="teamListPage.transferOwnershipSubTitle"
        components={{ b: <span className="bold" /> }}
        values={{ name: team.name }}
      />
    );
    return (
      <Dialog open={open} onClose={onClose} className="TeamTransferModalWrapper">
        <div className="TeamTransferModal">
          <h2 className="TeamTransferModal__title">{t('teamListPage.transferOwnership')}</h2>
          <div className="TeamTransferModal__subtitle">
            {message}
          </div>
          <div className="TeamTransferModal__content">
            {error && (
              <div className="TeamTransferModal__content__error">
                <span>{error}</span>
              </div>
            )}
            <h2 className="TeamTransferModal__content__label">{t('teamListPage.searchMember')}</h2>
            <div className="TeamTransferModal__content__search">
              <Input
                icon="search"
                onChange={this._onTextChanged}
                value={inputText}
                placeholder={t('teamListPage.enterNameOrEmailToSearch')}
                showClearButton
              />
            </div>
            {this._renderMemberList()}
            <div className="TeamTransferModal__footer">
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <ButtonMaterial fullWidth size={ButtonSize.XL} color={ButtonColor.TERTIARY} onClick={onClose}>
                    {t('common.cancel')}
                  </ButtonMaterial>
                </Grid>
                <Grid item xs={6}>
                  <ButtonMaterial
                    disabled={!selectedId}
                    fullWidth
                    size={ButtonSize.XL}
                    onClick={this._onSave}
                    loading={loading}
                  >
                    {t('teamListPage.transfer')}
                  </ButtonMaterial>
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}

TeamTransferModal.propTypes = {
  team: PropTypes.object,
  currentUser: PropTypes.object,
  client: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
  navigate: PropTypes.func,
  currentOrganization: PropTypes.object,
  isTabletUp: PropTypes.bool,
  t: PropTypes.func,
};
TeamTransferModal.defaultProps = {
  team: {},
  currentUser: {},
  client: {},
  open: false,
  onClose: () => {},
  onSaved: () => {},
  navigate: () => {},
  currentOrganization: {},
  isTabletUp: false,
  t: () => {},
};

export default compose(withTabletMatch, withTranslation())(TeamTransferModal);
