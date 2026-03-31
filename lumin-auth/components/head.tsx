import Head from 'next/head';

type CustomHeadProps = {
  title: string;
  suffix?: string;
};

function CustomHead(props: CustomHeadProps) {
  return (
    <Head>
      <title>{`${props.title}${props.suffix ?? ' - Lumin'}`}</title>
    </Head>
  );
}

export { CustomHead as Head };
