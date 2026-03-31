import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { withIdentity } from '@/components/hoc/withIdentity';
import { withRememberLastAccessAccount } from '@/components/hoc/withRememberLastAccessAccount';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutAuthenticated from '@/components/Layout/LayoutAuthenticated';
import SettingsPage from '@/components/SettingsPage';
import useTranslation from '@/hooks/useTranslation';
import { Identity } from '@/interfaces/ory';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';

type TProps = {
  identity: Identity;
};

function Settings({ identity }: TProps) {
  const { t } = useTranslation();
  return (
    <>
      <CustomHeader title={t('pageTitle.profileSettings')} />
      <SettingsPage identity={identity} />
    </>
  );
}

Settings.getLayout = function getLayout(page: ReactElement, pageProps: TProps) {
  return (
    <>
      <CustomHeader title='Profile Settings' description='Manage the profile information of your Lumin account.' metaTitle='Profile Settings | Lumin' />
      <LayoutAuthenticated {...pageProps}>{page}</LayoutAuthenticated>
    </>
  );
};

export default Settings;

export const getServerSideProps = getServerSidePipe(withIdentity, withTranslation, withRememberLastAccessAccount);
