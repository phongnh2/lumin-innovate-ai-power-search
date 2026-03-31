import React from 'react';

import withValidUserCheck from 'lumin-components/GeneralLayout/HOCs/withValidUserCheck';

import TOOLS_NAME from 'constants/toolsName';

import BaseIconStampTool, { IconStampToolProps } from './BaseIconStampTool';

const DotStampTool = (props: Omit<IconStampToolProps, 'stampToolName'>) => (
  <BaseIconStampTool {...props} stampToolName={TOOLS_NAME.DOT_STAMP} />
);

export default withValidUserCheck(DotStampTool, TOOLS_NAME.DOT_STAMP);
