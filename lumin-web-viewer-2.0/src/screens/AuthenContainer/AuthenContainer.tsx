import React from 'react';
import { Navigate } from 'react-router';

import { Routers } from 'constants/Routers';

const AuthenContainer = (): JSX.Element => <Navigate to={Routers.ROOT} />;

AuthenContainer.propTypes = {};

export default AuthenContainer;
