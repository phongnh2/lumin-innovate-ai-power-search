import useTranslation from '@/hooks/useTranslation';
import GmailLogo from '@/public/assets/gmail-logo.svg';
import { ButtonColor } from '@/ui/Button';
import { ButtonSize } from '@/ui/Button/types';

import * as Styled from './ButtonOpenGmail.styled';

const getSniperLinks = (email: string) => {
  const searchTrigger = '#search';
  const fromFilter = encodeURIComponent('from:@lumin');
  const spamPiercer = encodeURIComponent('in:anywhere');
  const timeFrame = encodeURIComponent('newer_than:1d');
  const accountScope = `u/${email.indexOf('+') === -1 ? email : email.slice(0, email.indexOf('+')) + email.slice(email.indexOf('@'), email.length)}`;
  return `https://mail.google.com/mail/${accountScope}/${searchTrigger}/${fromFilter}+${spamPiercer}+${timeFrame}`;
};

export default function ButtonOpenGmail({ email }: { email: string }) {
  const { t } = useTranslation();
  return (
    <Styled.ButtonOpenGmailWrapper>
      <Styled.ButtonOpenGmail
        component='a'
        href={getSniperLinks(email)}
        color={ButtonColor.SECONDARY_DARK}
        size={ButtonSize.XL}
        icon={
          <GmailLogo
            width={24}
            height={24}
            style={{
              marginRight: 8
            }}
          />
        }
        target='_blank'
      >
        {t('common.openGmail')}
      </Styled.ButtonOpenGmail>
    </Styled.ButtonOpenGmailWrapper>
  );
}
