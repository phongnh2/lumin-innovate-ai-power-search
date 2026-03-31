import PropTypes from 'prop-types';
import React, { useState } from 'react';

import ModalFooter from 'lumin-components/ModalFooter';
import Tooltip from 'lumin-components/Shared/Tooltip';
import Dialog from 'luminComponents/Dialog';
import Icomoon from 'luminComponents/Icomoon';
import MaterialAvatar from 'luminComponents/MaterialAvatar';
import SvgElement from 'luminComponents/SvgElement';

import { useTranslation } from 'hooks';

import { avatar } from 'utils';

import { ENTITY } from 'constants/lumin-common';
import { Colors, ModalSize } from 'constants/styles';

import * as Styled from './DeleteAccountFailedModal.styled';

const propTypes = {
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  ownershipResources: PropTypes.exact({
    orgTeams: PropTypes.array,
    organizations: PropTypes.array,
  }),
  isLoginExternal: PropTypes.bool,
};
const defaultProps = {
  onClose: () => {},
  onConfirm: () => {},
  ownershipResources: {
    orgTeams: [],
    organizations: [],
  },
  isLoginExternal: false,
};

const DeleteAccountFailedModal = ({ onClose, ownershipResources, isLoginExternal, onConfirm }) => {
  const { orgTeams, organizations } = ownershipResources;
  const defaultTab = organizations.length ? ENTITY.ORGANIZATION : ENTITY.ORGANIZATION_TEAM;
  const [tab, setTab] = useState(defaultTab);
  const isTabOrg = tab === ENTITY.ORGANIZATION;
  const isDisabledOrg = !organizations.length;
  const isTabTeam = tab === ENTITY.ORGANIZATION_TEAM;
  const isDisabledTeam = !orgTeams.length;

  const { t } = useTranslation();

  const renderSingleItem = ({ _id, name, subName, url, avatarRemoteId }, type) => {
    let icon = {
      default: null,
      variant: 'rounded',
    };
    switch (type) {
      case ENTITY.TEAM:
      case ENTITY.ORGANIZATION_TEAM: {
        icon = {
          default: 'team',
        };
        break;
      }
      case ENTITY.ORGANIZATION: {
        icon = {
          default: 'default-org-2',
        };
        break;
      }
      default: {
        break;
      }
    }

    return (
      <Styled.ListItem key={_id} type={type}>
        <MaterialAvatar src={avatar.getAvatar(avatarRemoteId)} size={32} variant={icon.variant} secondary>
          <Icomoon className={icon.default} size={18} color={Colors.NEUTRAL_60} />
        </MaterialAvatar>
        <Styled.ListItemContent>
          <Tooltip title={name}>
            <Styled.Link target="_blank" href={url}>
              {name}
            </Styled.Link>
          </Tooltip>
          <Styled.OrgName>{subName}</Styled.OrgName>
        </Styled.ListItemContent>
      </Styled.ListItem>
    );
  };
  const renderOrgList = () => organizations.map((item) => renderSingleItem(item, ENTITY.ORGANIZATION));
  const renderOrgTeamList = () => orgTeams.map((item) => renderSingleItem(item, ENTITY.ORGANIZATION_TEAM));
  const renderListItem = () => (
    <Styled.CustomScrollbars autoHide autoHeightMax={220} autoHeight>
      {Boolean(organizations.length) && isTabOrg && renderOrgList()}
      {Boolean(orgTeams.length) && isTabTeam && renderOrgTeamList()}
    </Styled.CustomScrollbars>
  );

  return (
    <Dialog open onClose={onClose} width={ModalSize.SM}>
      <Styled.Container>
        <Styled.Header>
          <Styled.IconContainer>
            <SvgElement content="icon-warning" width={48} height={48} />
            <Styled.Title>{t('settingGeneral.deactivateYourAccount')}</Styled.Title>
          </Styled.IconContainer>
          <Styled.Description>
            {t(isLoginExternal ? 'settingGeneral.descFailedDeleteAccount' : 'settingGeneral.warningTransferOwnerOrg')}
          </Styled.Description>
        </Styled.Header>
        <Styled.Tabs>
          <Styled.Tab active={isTabOrg} isDisabled={isDisabledOrg} onClick={() => setTab(ENTITY.ORGANIZATION)}>
            <Styled.Label active={isTabOrg}>{t('organizations', { ns: 'terms' })}</Styled.Label>
          </Styled.Tab>
          <Styled.Tab active={isTabTeam} isDisabled={isDisabledTeam} onClick={() => setTab(ENTITY.ORGANIZATION_TEAM)}>
            <Styled.Label active={isTabTeam}>{t('common.teams')}</Styled.Label>
          </Styled.Tab>
        </Styled.Tabs>
        <Styled.ListContainer>{renderListItem()}</Styled.ListContainer>
        <Styled.ButtonWrapper>
          <ModalFooter
            onSubmit={onConfirm}
            onCancel={onClose}
            label={t(isLoginExternal ? 'settingGeneral.deactivate' : 'common.continue')}
          />
        </Styled.ButtonWrapper>
      </Styled.Container>
    </Dialog>
  );
};

DeleteAccountFailedModal.propTypes = propTypes;
DeleteAccountFailedModal.defaultProps = defaultProps;

export default React.memo(DeleteAccountFailedModal);
