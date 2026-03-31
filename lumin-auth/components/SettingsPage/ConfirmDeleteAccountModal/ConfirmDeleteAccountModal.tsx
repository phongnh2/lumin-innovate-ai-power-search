import { css } from '@emotion/react';
import { useEffect, useState } from 'react';

import { OrganizationEntity } from '@/constants/common';
import useTranslation from '@/hooks/useTranslation';
import { storageUrl } from '@/lib/aws/utils';
import { useAppSelector } from '@/lib/hooks';
import { isModalProcessing } from '@/selectors';
import { Colors, Button, AvatarSize, Avatar, Text } from '@/ui';
import { ButtonColor } from '@/ui/Button';
import { Dialog, DialogSize, DialogType } from '@/ui/Dialog';
import { getIcon } from '@/ui/Dialog/ConfirmationDialog';
import Icomoon from '@/ui/Icomoon';

import { TTransformResource } from '../interfaces';

import useGetDeleteAccountConfirmMessage from './useGetDeleteAccountConfirmMessage';

import * as Styled from './ConfirmDeleteAccountModal.styled';
import {
  containerCss,
  headerCss,
  iconContainerCss,
  titleCss,
  descriptionCss,
  tabsCss,
  linkCss,
  orgNameCss,
  buttonWrapperCss,
  footerCss,
  labelCss,
  tabCss,
  activeTabCss,
  activeLabelCss,
  avatarContainerCss,
  teamItemCss,
  orgItemCss,
  listItemCss,
  disableTabCss,
  disableLabelCss
} from './ConfirmDeleteAccountModal.styled';

type TProps = {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  ownershipResources: {
    orgTeams: TTransformResource[];
    organizations: TTransformResource[];
  };
};

function ConfirmDeleteAccountModal(props: TProps): JSX.Element {
  const { t } = useTranslation();
  const {
    ownershipResources: { orgTeams = [], organizations = [] },
    onConfirm,
    onClose,
    open
  } = props;
  const [tab, setTab] = useState(OrganizationEntity.Organization);
  const { ConfirmInput, matchConfirmString } = useGetDeleteAccountConfirmMessage();

  const isTabOrg = tab === OrganizationEntity.Organization;
  const isTabTeam = tab === OrganizationEntity.OrganizationTeam;
  const isDisabledOrg = !organizations.length;
  const isDisabledTeam = !orgTeams.length;
  useEffect(() => {
    setTab(organizations.length ? OrganizationEntity.Organization : OrganizationEntity.OrganizationTeam);
  }, [orgTeams.length, organizations.length]);

  const renderItem = ({ _id, name, subName, url, avatarRemoteId }: TTransformResource, type: OrganizationEntity) => {
    const mappingIcon = {
      [OrganizationEntity.OrganizationTeam]: 'team',
      [OrganizationEntity.Organization]: 'default-org-2'
    };

    return (
      <li key={_id} css={[listItemCss, type === OrganizationEntity.Organization ? orgItemCss : teamItemCss]}>
        <div css={avatarContainerCss}>
          {avatarRemoteId ? (
            <Avatar src={avatarRemoteId && storageUrl(avatarRemoteId)} name='profile-image' size={AvatarSize.XXS} />
          ) : (
            <Icomoon type={mappingIcon[type]} size={18} color={Colors.NEUTRAL_60} />
          )}
        </div>
        <div>
          <Text as='a' css={linkCss} target='_blank' href={url}>
            {name}
          </Text>
          <Text as='p' css={orgNameCss}>
            {subName}
          </Text>
        </div>
      </li>
    );
  };

  const renderOrgList = () => organizations.map(item => renderItem(item, OrganizationEntity.Organization));
  const renderOrgTeamList = () => orgTeams.map(item => renderItem(item, OrganizationEntity.OrganizationTeam));

  const renderListItem = (): JSX.Element => (
    <Styled.CustomScrollbars autoHide autoHeightMax={220} autoHeight>
      {Boolean(organizations.length) && isTabOrg && renderOrgList()}
      {Boolean(orgTeams.length) && isTabTeam && renderOrgTeamList()}
    </Styled.CustomScrollbars>
  );
  const isProcessing = useAppSelector(state => isModalProcessing(state));
  return (
    <Dialog
      open={open}
      onClose={() => {
        if (isProcessing) return;
        onClose();
      }}
      size={DialogSize.SM}
    >
      <div css={containerCss}>
        <div css={headerCss}>
          <div css={iconContainerCss}>
            {getIcon({ type: DialogType.Warn, props: { height: 48 } })}
            <Text as='h1' css={titleCss}>
              {t('account.deleteAccount')}
            </Text>
          </div>
          <Text as='p' css={descriptionCss}>
            {t('account.messageDeactivateYourAccount1')}
          </Text>
          <Text as='p' css={descriptionCss}>
            {t('account.messageDeactivateYourAccount2')}
          </Text>
          <Text as='p' css={descriptionCss}>
            {t('account.thisActionCannotBeUndone')}
          </Text>
        </div>
        <div css={tabsCss}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div css={[tabCss, isTabOrg && activeTabCss, isDisabledOrg && disableTabCss]} onClick={() => setTab(OrganizationEntity.Organization)}>
            <Text as='p' css={[labelCss, isTabOrg && activeLabelCss, isDisabledOrg && disableLabelCss]}>
              {t('organizations', { ns: 'terms' })}
            </Text>
          </div>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div css={[tabCss, isTabTeam && activeTabCss, isDisabledTeam && disableTabCss]} onClick={() => setTab(OrganizationEntity.OrganizationTeam)}>
            <Text as='p' css={[labelCss, isTabTeam && activeLabelCss, isDisabledTeam && disableLabelCss]}>
              {t('teams', { ns: 'terms' })}
            </Text>
          </div>
        </div>
        <div>{renderListItem()}</div>
        <div css={buttonWrapperCss}>
          <ConfirmInput
            css={css`
              margin-top: 10px;
            `}
          />
          <div css={footerCss}>
            <Button onClick={onClose} color={ButtonColor.TERTIARY} disabled={isProcessing}>
              {t('common.cancel')}
            </Button>
            <Button onClick={onConfirm} disabled={!matchConfirmString} loading={isProcessing}>
              {t('account.delete')}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ConfirmDeleteAccountModal;
