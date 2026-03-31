/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { LocalStorageKey } from '@/constants/localStorageKey';
import { setIdentity } from '@/features/account/account-slice';
import { frontendApi } from '@/lib/ory';
import sessionManagement from '@/lib/session';
import { removeAuthenticationCredentials } from '@/utils/auth.utils';

function withAuthorized(WrappedComponent: React.ComponentType<any>): (props: any) => JSX.Element {
  function HOC(props: any) {
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();

    const getAuthorization = async () => {
      frontendApi
        .toSession({
          tokenizeAs: 'lumin_authorization_jwt'
        })
        .then(({ data: sess }): void => {
          sessionManagement.setNewAuthorizedToken(sess.tokenized as string);
          dispatch(
            setIdentity({
              ...props.identity,
              ...sess.identity
            })
          );
          setIsLoading(false);
        })
        .catch(() => {
          // Check if login method change is pending - if so, don't redirect
          // The forceLogInAgain modal will handle the logout flow
          const loginMethodChangePending = localStorage.getItem(LocalStorageKey.LOGIN_METHOD_CHANGE_PENDING);
          if (loginMethodChangePending) {
            return;
          }
          removeAuthenticationCredentials();
        });
    };

    useEffect(() => {
      getAuthorization();
    }, []);

    return isLoading ? <></> : <WrappedComponent {...props} />;
  }
  return HOC;
}

export default withAuthorized;
