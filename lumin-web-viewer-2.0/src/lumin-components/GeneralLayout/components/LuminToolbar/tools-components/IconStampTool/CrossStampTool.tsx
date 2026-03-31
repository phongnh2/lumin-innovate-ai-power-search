import React from 'react';

import withValidUserCheck from 'lumin-components/GeneralLayout/HOCs/withValidUserCheck';

import TOOLS_NAME from 'constants/toolsName';

import BaseIconStampTool, { IconStampToolProps } from './BaseIconStampTool';

const CrossStampTool = (props: Omit<IconStampToolProps, 'stampToolName'>) => (
  <BaseIconStampTool {...props} stampToolName={TOOLS_NAME.CROSS_STAMP} />
);

export default withValidUserCheck(CrossStampTool, TOOLS_NAME.CROSS_STAMP);
