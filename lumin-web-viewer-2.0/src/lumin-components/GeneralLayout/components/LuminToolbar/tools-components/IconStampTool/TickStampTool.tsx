import React from 'react';

import withValidUserCheck from 'lumin-components/GeneralLayout/HOCs/withValidUserCheck';

import { TOOLS_NAME } from 'constants/toolsName';

import { BaseIconStampTool, IconStampToolProps } from './BaseIconStampTool';

const TickStampTool = (props: Omit<IconStampToolProps, 'stampToolName'>) => (
  <BaseIconStampTool {...props} stampToolName={TOOLS_NAME.TICK_STAMP} />
);

export default withValidUserCheck(TickStampTool, TOOLS_NAME.TICK_STAMP);
