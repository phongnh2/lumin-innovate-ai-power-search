import React from 'react';

import LeftPanelTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/LeftPanelTool';
import RotateTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/RotateTool';
import SelectTools from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/SelectTools';
import ViewControlTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ViewControlTool';
import ZoomTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ZoomTool';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';

import styles from './ToolbarSecurityLeftSection.module.scss';

const ToolbarSecurityLeftSection = () => (
  <div className={styles.wrapper}>
    <LeftPanelTool />

    <Divider orientation="vertical" />
    <ZoomTool />
    <ViewControlTool />
    <RotateTool />

    <Divider orientation="vertical" />

    <SelectTools />
  </div>
);

export default ToolbarSecurityLeftSection;
