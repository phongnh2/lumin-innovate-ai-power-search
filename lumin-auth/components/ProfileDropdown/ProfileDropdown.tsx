import { environment } from '@/configs/environment';
import useTranslation from '@/hooks/useTranslation';
import { Traits } from '@/interfaces/ory';
import { Avatar, AvatarSize, Menu, MenuItem } from '@/ui';

import * as Styled from './ProfileDropdown.styled';

function ProfileDropdown({ name, avatarRemoteId, email, closePopper, onShowLogoutModal }: TProps) {
  const { t } = useTranslation();
  const avatarPath = avatarRemoteId && `${environment.public.host.backendUrl}/user/getAvatar?remoteId=${avatarRemoteId}`;
  return (
    <Styled.Container>
      <Styled.AvatarContainer>
        <Avatar name={name} remotePath={avatarPath} size={{ tablet: AvatarSize.MD, mobile: AvatarSize.XXS }} />
        <Styled.InfoContainer>
          <Styled.Name bold level={4}>
            {name}
          </Styled.Name>
          <Styled.Email variant='secondary'>{email}</Styled.Email>
        </Styled.InfoContainer>
      </Styled.AvatarContainer>
      <Menu closePopper={closePopper}>
        {/* FIXME: This menu will be enabled later */}
        {/* <MenuItem closeOnDone component={Link} href={Routes.Settings} icon='setting' label='Profile setting' /> */}
        <MenuItem closeOnDone icon='signout' onClick={onShowLogoutModal} label={t('common.signOut')} variant='neutral' />
      </Menu>
    </Styled.Container>
  );
}

type TProps = Pick<Traits, 'name' | 'email' | 'avatarRemoteId'> & { closePopper: () => void; onShowLogoutModal: () => void };

export default ProfileDropdown;
