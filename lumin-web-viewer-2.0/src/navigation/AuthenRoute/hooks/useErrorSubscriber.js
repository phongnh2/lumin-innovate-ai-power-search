import { useEffect, useRef } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import selectors from 'selectors';
import ApolloErrorObservable from '../../../apollo/ApolloErrorObservable';

import CommonErrorSubscriber from '../ErrorHandling/CommonErrorSubscriber';

function useErrorSubscriber() {
  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);
  const errorSubscriber = useRef(null);
  useEffect(() => {
    if (currentUser) {
      errorSubscriber.current = new CommonErrorSubscriber(currentUser);
      ApolloErrorObservable.subscribe(errorSubscriber.current);
    }
    return () => {
      if (errorSubscriber.current) {
        errorSubscriber.current.destructor();
        ApolloErrorObservable.unsubscribe(errorSubscriber.current);
      }
    };
  }, [currentUser]);
}

export default useErrorSubscriber;
