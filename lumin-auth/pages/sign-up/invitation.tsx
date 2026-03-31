import dynamic from 'next/dynamic';
import { ReactElement } from 'react';

import CustomHeader from '@/components/CustomHeader/CustomHeader';
import { Header } from '@/components/Header';
import { withInvitation } from '@/components/hoc/withInvitation';
import { withTranslation } from '@/components/hoc/withTranslation';
import LayoutSignAuth from '@/components/Layout/LayoutSignAuth';
import InvitationExpired from '@/components/SignAuth/InvitationExpired';
import SignUpInvitationForm from '@/components/SignAuth/SignUpInvitationForm';
import { InvitationTokenStatus, UserInvitationTokenType } from '@/interfaces/auth';
import { getServerSidePipe } from '@/pipe/getServerSidePipe';
import { InvitationTokenMetadataOutput } from '@/proto/auth/kratos/InvitationTokenMetadata';

const HeaderSignInElement = dynamic(() => import('@/components/HeaderSignInElement'), { ssr: false });

type TProps = {
  email: string;
  type: string;
  isSignedUp: boolean;
  metadata: Partial<InvitationTokenMetadataOutput>;
  token: string;
  status: InvitationTokenStatus;
};

function Invitation({ email, token, status }: TProps) {
  if (status === InvitationTokenStatus.EXPIRED) {
    return <InvitationExpired />;
  }

  return (
    <>
      <CustomHeader noIndex />
      <Header right={<HeaderSignInElement />} />
      <SignUpInvitationForm token={token} email={email} />
    </>
  );
}

Invitation.getLayout = function getLayout(page: ReactElement, pageProps: TProps) {
  const { type, status } = pageProps;
  if (status === InvitationTokenStatus.EXPIRED) {
    return page;
  }
  const getFormTitle = (): string => {
    switch (type) {
      case UserInvitationTokenType.CIRCLE_INVITATION:
        return 'invitationRegistration.signUpToJoinCircle';
      case UserInvitationTokenType.SHARE_DOCUMENT:
        return 'invitationRegistration.signUpToAccessDocuments';
      default:
        return '';
    }
  };
  return (
    <LayoutSignAuth {...pageProps} i18nKeyTitle={getFormTitle()}>
      {page}
    </LayoutSignAuth>
  );
};

export default Invitation;

export const getServerSideProps = getServerSidePipe(withInvitation, withTranslation);
