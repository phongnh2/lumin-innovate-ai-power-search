/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import Loading from 'lumin-components/Loading';

type IProps = {
  setLastElement: (element: HTMLDivElement) => void;
};

const FetchMoreLoading = ({ setLastElement }: IProps): JSX.Element => (
  // @ts-ignore
  <Loading normal ref={setLastElement} containerStyle={{ padding: '16px 0' }} />
);

export default FetchMoreLoading;
