import React from 'react';
import { connect } from 'react-redux';

import * as Styled from 'lumin-components/GeneralLayout/components/LuminToolbar/LuminToolbar.styled';
import AddParagraphTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/AddParagraphTool';
import LeftPanelTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/LeftPanelTool';
import SelectTools from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/SelectTools';
import ViewControlTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ViewControlTool';
import ZoomTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ZoomTool';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';

import RedoEditTextTool from '../tools-components/RedoEditTextTool';
import UndoEditTextTool from '../tools-components/UndoEditTextTool';

const ToolbarEditPdfLeftSection = () => (
  <Styled.ToolbarSectionWrapper>
    <LeftPanelTool />
    <Divider orientation="vertical" />
    <ZoomTool />
    <ViewControlTool />
    <Divider orientation="vertical" />
    <SelectTools />
    <UndoEditTextTool />
    <RedoEditTextTool />
    <Divider orientation="vertical" />
    <AddParagraphTool />
  </Styled.ToolbarSectionWrapper>
);

ToolbarEditPdfLeftSection.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarEditPdfLeftSection);
