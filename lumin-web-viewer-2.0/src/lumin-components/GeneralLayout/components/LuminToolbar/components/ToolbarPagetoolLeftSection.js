import React from 'react';

import * as Styled from 'lumin-components/GeneralLayout/components/LuminToolbar/LuminToolbar.styled';
import GridViewTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/page-tools/GridViewTool';
import SingleViewTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/page-tools/SingleViewTool';

const ToolbarPagetoolLeftSection = () => (
  <Styled.ToolbarSectionWrapper>
    <GridViewTool />
    <SingleViewTool />
  </Styled.ToolbarSectionWrapper>
);

export default ToolbarPagetoolLeftSection;
