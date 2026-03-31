import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import ButtonMaterial from 'luminComponents/ButtonMaterial';
import Dialog from 'luminComponents/Dialog';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import Skeleton from 'luminComponents/Shared/Skeleton';

import { useTabletMatch, useTranslation } from 'hooks';

import { teamServices } from 'services';

import logger from 'helpers/logger';

import { dateUtil, avatar } from 'utils';

import { PLAN_TYPE } from 'constants/plan';
import './TeamInfoModal.scss';

const propTypes = {
  team: PropTypes.object,
  open: PropTypes.bool,
  onClose: PropTypes.func,
};

const defaultProps = {
  team: {},
  open: false,
  onClose: () => {},
};

const MAX_MEMBER = 4;

const paymentText = {
  FREE: 'Free',
  FREE_TRIAL: 'Promotion',
  TEAM: 'Premium',
};

function TeamInfoModal(props) {
  const { open, onClose, team } = props;
  const [teamInfo, setTeamInfo] = useState({});
  const { totalMembers, members, orgOwned = team.belongsTo, payment = {}, name, owner = {}, createdAt } = teamInfo;
  const isTabletUp = useTabletMatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      const fetchingTeamInfo = async () => {
        try {
          const response = await teamServices.getTeamInfo(team._id);
          setTeamInfo(response.data.team);
        } catch (error) {
          logger.logError({ error });
        }
      };
      fetchingTeamInfo();
    }
  }, [open]);

  const onExited = () => {
    setTeamInfo({});
  };

  const renderExtendMembers = () => {
    if (totalMembers >= MAX_MEMBER + 1) {
      return (
        <MaterialAvatar containerClasses="TeamInfoModal__content-member__avt" size={24}>
          <p className="TeamInfoModal__remaining">+{totalMembers - MAX_MEMBER}</p>
        </MaterialAvatar>
      );
    }
  };

  const renderTeamMembersAvatars = () =>
    members.map((member) => (
      <MaterialAvatar
        containerClasses="TeamInfoModal__content-member__avt"
        size={24}
        key={member._id}
        src={avatar.getAvatar(member.avatarRemoteId)}
      >
        {avatar.getTextAvatar(member.name)}
      </MaterialAvatar>
    ));

  const renderMembersSkeletonElement = Array(5)
    .fill()
    .map((_, index) => (
      <Skeleton className="TeamInfoModal__content-member__avt" variant="circular" key={index} width={24} height={24} />
    ));

  const renderTeamSizeDetailElement =
    !totalMembers || !members ? (
      <>
        <p className="TeamInfoModal__content-detail">
          <Skeleton variant="text" />
        </p>
        <div className="TeamInfoModal__content-members">{renderMembersSkeletonElement}</div>
      </>
    ) : (
      <>
        <p className="TeamInfoModal__content-detail">
          {t(`teamMember.totalMember${totalMembers >= 2 ? 's' : ''}`, { totalMembers })}
        </p>
        <div className="TeamInfoModal__content-members">
          {renderTeamMembersAvatars()}
          {renderExtendMembers()}
        </div>
      </>
    );

  const renderContentDetail = (content) => content || <Skeleton variant="text" />;

  const getPaymentDetail = ({ type }) => {
    if (!type) {
      return null;
    }

    return (
      <p className="TeamInfoModal__content-detail">
        {type === PLAN_TYPE.FREE ? (
          <span className="free">{paymentText.FREE}</span>
        ) : (
          <span className="premium">{paymentText[type] || paymentText.TEAM}</span>
        )}
      </p>
    );
  };

  const text = {
    info: t('teamMember.teamInfo'),
    name: t('teamCommon.name'),
    orgName: t('createOrg.orgName'),
    size: t('teamMember.teamSize'),
    plan: t('teamMember.teamPlan'),
  };

  const renderDialogContent = () => (
    <>
      <h1 className="TeamInfoModal__title">{text.info}</h1>
      <div className="TeamInfoModal__content">
        {orgOwned && (
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item xs={6}>
              <p className="TeamInfoModal__content-title">{text.orgName}</p>
            </Grid>
            <Grid item xs={6}>
              <p className="TeamInfoModal__content-detail TeamInfoModal__content-detail--name">
                {renderContentDetail(orgOwned.detail?.name)}
              </p>
            </Grid>
          </Grid>
        )}
        <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-title">{text.name}</p>
          </Grid>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-detail TeamInfoModal__content-detail--name">
              {renderContentDetail(name)}
            </p>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-title">{t('teamMember.creator')}</p>
          </Grid>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-detail">{renderContentDetail(owner.name)}</p>
          </Grid>
        </Grid>
        <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-title">{t('teamMember.created')}</p>
          </Grid>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-detail">
              {renderContentDetail(createdAt && dateUtil.formatMDYTime(createdAt))}
            </p>
          </Grid>
        </Grid>
        <Divider />
        {!orgOwned && (
          <Grid container alignItems="flex-start" spacing={2}>
            <Grid item xs={6}>
              <p className="TeamInfoModal__content-title">{text.plan}</p>
            </Grid>
            <Grid item xs={6}>
              {renderContentDetail(getPaymentDetail(payment))}
            </Grid>
          </Grid>
        )}
        <Grid container alignItems="flex-start" spacing={2}>
          <Grid item xs={6}>
            <p className="TeamInfoModal__content-title">{text.size}</p>
          </Grid>
          <Grid item xs={6}>
            {renderTeamSizeDetailElement}
          </Grid>
        </Grid>
        <Divider />
      </div>
      <ButtonMaterial fullWidth size={ButtonSize.XL} onClick={onClose} style={{ marginTop: isTabletUp ? 16 : 0 }}>
        {t('common.ok')}
      </ButtonMaterial>
    </>
  );

  return (
    <Dialog open={open} onClose={onClose} onExited={onExited} className="TeamInfoModal" width={400}>
      <div>{renderDialogContent()}</div>
    </Dialog>
  );
}

TeamInfoModal.propTypes = propTypes;
TeamInfoModal.defaultProps = defaultProps;

export default TeamInfoModal;
