import Image from 'next/image';

import CrashImage from '@/public/assets/crash.svg';
import { Text, Button } from '@/ui';
import { ButtonSize } from '@/ui/Button/types';

import { crashContainerCss, crashImageCss, titleCss, messageCss } from './Crash.styled';

function Crash(): JSX.Element {
  return (
    <>
      <div css={crashContainerCss}>
        <Image src={CrashImage} css={crashImageCss} alt={'Crash image'} />
        <Text css={titleCss}>Something went wrong</Text>
        <Text css={messageCss}>Sorry, we’re having some technical issues. Try to refresh the page.</Text>
        <Button width={200} size={ButtonSize.XL} onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    </>
  );
}

export default Crash;
