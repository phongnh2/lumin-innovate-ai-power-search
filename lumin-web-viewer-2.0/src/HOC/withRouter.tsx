import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

function withRouter<T>(WrapComponent: React.ComponentType<T & { location: any, navigate: any }>): (props: T) => JSX.Element {
  function HOC(props: T): JSX.Element {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    return <WrapComponent {...props} location={location} navigate={navigate} match={{ params }} />;
  }

  return HOC;
}

export default withRouter;
