import { Analytics, Amplify, Auth } from 'aws-amplify';

import { amplifyConfig, analyticsConfig } from './aws-config';

Amplify.configure(amplifyConfig);
Auth.configure(amplifyConfig);

Analytics.configure(analyticsConfig);

export default Analytics;
