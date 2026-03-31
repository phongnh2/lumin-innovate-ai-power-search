import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class AppDocument extends Document {
  // static async getInitialProps(
  //   ctx: DocumentContext
  // ): Promise<DocumentInitialProps> {
  //   const page = await ctx.renderPage();
  //   const { css, ids } = emotion.renderStatic(page.html);
  //   const initialProps = await Document.getInitialProps(ctx);
  //   return {
  //     ...initialProps,
  //     styles: (
  //       <>
  //         {initialProps.styles}
  //         <style
  //           data-emotion={`css ${ids.join(' ')}`}
  //           dangerouslySetInnerHTML={{ __html: css }}
  //         />
  //       </>
  //     )
  //   };
  // }

  render(): JSX.Element {
    return (
      <Html>
        <Head />
        <body className='h-screen text-neutral-100'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
