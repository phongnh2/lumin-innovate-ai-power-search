import React from 'react';

import BaseMultipleChildTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/BaseMultipleChildTool';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';

const ShapeTool = (props) => <BaseMultipleChildTool forToolGroup="shapeTools" {...props} />;

export default withValidUserCheck(ShapeTool, 'shapeTools');
