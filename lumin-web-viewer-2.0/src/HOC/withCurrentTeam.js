import React, { useMemo } from 'react';

import { useGetCurrentTeam } from 'hooks';

const withCurrentTeam = (Component) => (props) => {
  const currentTeam = useGetCurrentTeam();
  return useMemo(
    () => <Component {...props} currentTeam={currentTeam} />,
    [currentTeam, props],
  );
};

withCurrentTeam.propTypes = {

};

export default withCurrentTeam;
