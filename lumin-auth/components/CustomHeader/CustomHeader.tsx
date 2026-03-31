import Head from 'next/head';

import { environment } from '@/configs/environment';

interface IProps {
  noIndex?: boolean;
  description?: string;
  metaTitle?: string;
  title?: string;
  ogImage?: string;
}

const CustomHeader = (props: IProps): JSX.Element => {
  const { noIndex, description, metaTitle, title, ogImage } = props;

  const defaultOgImage = `${environment.public.host.authUrl}/assets/lumin-thumbnail.png`;
  const imageUrl = ogImage ?? defaultOgImage;

  return (
    <Head>
      {noIndex && <meta name='robots' content='noindex, nofollow' />}
      {metaTitle && (
        <>
          <meta name='title' content={metaTitle} />
          <meta name='og:title' content={metaTitle} />
        </>
      )}
      {description && (
        <>
          <meta name='description' content={description} />
          <meta name='og:description' content={description} />
        </>
      )}
      <meta property='og:image' content={imageUrl} />
      <meta property='og:url' content={environment.public.host.staticUrl} />
      <meta property='og:image:alt' content='Lumin Thumbnail' />
      <meta property='og:type' content='website' />
      {title && <title>{`${title} | Lumin`}</title>}
    </Head>
  );
};

export default CustomHeader;
