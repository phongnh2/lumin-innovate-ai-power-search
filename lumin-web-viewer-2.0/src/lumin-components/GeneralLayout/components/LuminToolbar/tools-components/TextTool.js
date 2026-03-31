import React from 'react';

import BaseMultipleChildTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/BaseMultipleChildTool';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';

const TextTool = (props) => <BaseMultipleChildTool forToolGroup="textTools" {...props} />;

export default withValidUserCheck(TextTool, 'textTools');
