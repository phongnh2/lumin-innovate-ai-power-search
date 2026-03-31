import { useRouter } from 'next/router';
import { Trans } from 'next-i18next';

import { QUERY_KEYS } from '@/constants/common';
import useTranslation from '@/hooks/useTranslation';
import { ConfirmationDialog, Text } from '@/ui';

import { SocialSignInProvider } from './constant';

const RequestEnableSocialSignIn = ({ onConfirm }: { onConfirm: (provider: SocialSignInProvider) => any }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { pathname, query } = router;

  const email = query[QUERY_KEYS.REQUEST_SOCIAL_SIGN_IN] as string;
  const provider = query[QUERY_KEYS.PROVIDER] as SocialSignInProvider;
  const open = Boolean(email) && Boolean(provider);

  const removeQuery = () => {
    delete query[QUERY_KEYS.REQUEST_SOCIAL_SIGN_IN];
    delete query[QUERY_KEYS.PROVIDER];
    router.replace({
      pathname,
      query
    });
  };

  return (
    <ConfirmationDialog
      open={open}
      title={t('requestMemberEnableSocialSignIn.title', { provider })}
      onConfirm={() => {
        removeQuery();
        onConfirm(provider);
      }}
      message={
        <Text align='center'>
          <Trans i18nKey='requestMemberEnableSocialSignIn.message' components={{ b: <b /> }} values={{ email, provider }} />
        </Text>
      }
      confirmText={t('common.ok')}
    />
  );
};

export default RequestEnableSocialSignIn;
