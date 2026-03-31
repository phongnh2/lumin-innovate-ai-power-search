import useTranslation from '@/hooks/useTranslation';

import * as Styled from './AuthMethodDivider.styled';

type TProps = {
  text?: string;
};

function AuthMethodDivider({ text }: TProps) {
  const { t } = useTranslation();
  return (
    <Styled.Container>
      <Styled.Text>{text ?? t('authPage.orUseYourEmail')}</Styled.Text>
    </Styled.Container>
  );
}

export default AuthMethodDivider;
