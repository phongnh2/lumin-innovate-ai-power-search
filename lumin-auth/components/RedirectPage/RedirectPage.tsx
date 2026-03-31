import Image from 'next/image';

import RedirectImage from '@/public/assets/redirect-illustration.svg?url';

import * as Styled from './RedirectPage.styled';

const RedirectPage = () => {
  return (
    <Styled.Container>
      <Styled.Wrapper>
        <Image src={RedirectImage} priority alt='Redirect' />
        <Styled.Title>Hold on</Styled.Title>
        <Styled.Content>Lumin is opening your document...</Styled.Content>
      </Styled.Wrapper>
    </Styled.Container>
  );
};

export default RedirectPage;
