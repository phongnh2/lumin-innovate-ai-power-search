import React from 'react';
import { connect, useSelector } from 'react-redux';

import * as Styled from 'lumin-components/GeneralLayout/components/LuminToolbar/LuminToolbar.styled';
import LeftPanelTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/LeftPanelTool';
import RedoTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/RedoTool';
import RotateTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/RotateTool';
import SelectTools from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/SelectTools';
import UndoTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/UndoTool';
import ViewControlTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ViewControlTool';
import ZoomTool from 'lumin-components/GeneralLayout/components/LuminToolbar/tools-components/ZoomTool';
import Divider from 'lumin-components/GeneralLayout/general-components/Divider';

import PlayControl from 'features/ReadAloud/components/PlayControl';
import SpeakingRate from 'features/ReadAloud/components/SpeakingRate';
import { useEnabledReadAloud } from 'features/ReadAloud/hooks/useEnabledReadAloud';
import { readAloudSelectors } from 'features/ReadAloud/slices';

import ReadAloudTool from '../tools-components/ReadAloudTool';

const ToolbarLeftSection = () => {
  const isInReadAloudMode = useSelector(readAloudSelectors.isInReadAloudMode);
  const { enabled: enabledReadAloud } = useEnabledReadAloud();

  if (isInReadAloudMode) {
    return (
      <Styled.ToolbarSectionWrapper>
        <SelectTools />
        <Divider orientation="vertical" />
        <SpeakingRate />
        <Divider orientation="vertical" />
        <PlayControl />
      </Styled.ToolbarSectionWrapper>
    );
  }

  return (
    <Styled.ToolbarSectionWrapper>
      <LeftPanelTool />

      <Divider orientation="vertical" />
      {enabledReadAloud && (
        <>
          <ReadAloudTool />
          <Divider orientation="vertical" />
        </>
      )}
      <ZoomTool />
      <ViewControlTool />
      <RotateTool />

      <Divider orientation="vertical" />

      <SelectTools />

      <Divider orientation="vertical" />

      <UndoTool />
      <RedoTool />
    </Styled.ToolbarSectionWrapper>
  );
};

ToolbarLeftSection.propTypes = {};

const mapStateToProps = () => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ToolbarLeftSection);
