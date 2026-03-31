import Image, { ImageProps } from 'next/image';
import Link from 'next/link';
import React, { useMemo } from 'react';

import luminLogoImg from '@/public/assets/logo-lumin.svg?url';

type TExtraImageProps = {
  alt?: string;
  href?: string;
  link?: boolean;
};

type TProps = Omit<ImageProps, 'src' | 'alt'> & TExtraImageProps;

function LuminLogo({ alt = 'lumin-logo', link = false, href = 'https://luminpdf.com/', ...rest }: TProps): JSX.Element {
  const img = useMemo(() => {
    return <Image src={luminLogoImg} alt={alt} {...rest} />;
  }, [rest, alt]);
  if (!link) {
    return img;
  }
  return <Link href={href}>{img}</Link>;
}

export default LuminLogo;
