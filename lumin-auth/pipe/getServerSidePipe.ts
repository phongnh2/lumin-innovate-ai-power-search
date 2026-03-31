import { merge } from 'lodash';
import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';

type PipedGetServerSideProps = (props: any) => Promise<any>;

export const getServerSidePipe =
  <TProps extends Record<string, unknown>>(...functions: PipedGetServerSideProps[]) =>
  async (context: GetServerSidePropsContext): Promise<GetServerSidePropsResult<TProps>> => {
    let result: GetServerSidePropsResult<TProps> = { props: {} as TProps };
    for (const fn of functions) {
      const fnResult = await fn(context);
      result = merge({}, result, fnResult);
    }
    return result;
  };
