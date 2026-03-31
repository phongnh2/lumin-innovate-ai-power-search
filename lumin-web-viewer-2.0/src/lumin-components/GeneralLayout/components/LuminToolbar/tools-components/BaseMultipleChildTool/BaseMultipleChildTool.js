import PropTypes from 'prop-types';
import React, { useContext, useMemo, useState } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { getColor, switchTool } from 'lumin-components/GeneralLayout/components/LuminToolbar/utils.js';
import ShapeToolsStylePalette from 'lumin-components/GeneralLayout/components/ShapeToolsStylePalette';
import TextToolStylePalette from 'lumin-components/GeneralLayout/components/TextToolStylePalette';
import ToolbarPopover from 'luminComponents/GeneralLayout/components/LuminToolbar/components/ToolbarPopover';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';
import useDidUpdate from 'hooks/useDidUpdate';

import { DataElements } from 'constants/dataElement';

import { useToolbarContext } from '../../components/ToolbarContext';
import { ToolbarItemContext } from '../../components/ToolbarItem';

const TOOL_GROUPS_MAPPING = {
  SHAPE_TOOLS: 'shapeTools',
  TEXT_TOOLS: 'textTools',
};

const DATA_TOOL_MAPPING = {
  shapeTools: {
    toolGroupName: TOOL_GROUPS_MAPPING.SHAPE_TOOLS,
    label: 'documentPage.shape',
    contentDOMWidth: 312,
    secondaryTooltip: 'toolOption.shape',
    dataElement: DataElements.SHAPE_TOOL_GROUP_BUTTON,
  },
  textTools: {
    dataElement: DataElements.TEXT_TOOL_GROUP_BUTTON,
    toolGroupName: TOOL_GROUPS_MAPPING.TEXT_TOOLS,
    label: 'component.textToolsButton',
    contentDOMWidth: 274,
    secondaryTooltip: 'toolOption.text',
  },
};

const ICON_MAPPING = {
  AnnotationCreateRectangle: 'md_rectangle',
  AnnotationCreateEllipse: 'md_ellipse',
  AnnotationCreateLine: 'md_line',
  AnnotationCreateArrow: 'md_arrow',
  AnnotationCreatePolyline: 'md_polyline',
  AnnotationCreatePolygon: 'md_polygon',
  AnnotationCreatePolygonCloud: 'md_cloud',
  AnnotationCreateStar: 'md_star',
  AnnotationCreateCross: 'md_cross',
  AnnotationCreateTick: 'md_tick',
  AnnotationCreateTextUnderline: 'md_text_underline',
  AnnotationCreateTextSquiggly: 'md_squiggly',
  AnnotationCreateTextStrikeout: 'md_text_strike_through',
};

const renderPopoverContent = ({ forToolGroup, onToolClick, tools, toolData }) => {
  if (forToolGroup === TOOL_GROUPS_MAPPING.SHAPE_TOOLS) {
    return <ShapeToolsStylePalette onToolClick={onToolClick} tools={tools} toolObjects={toolData} />;
  }

  if (forToolGroup === TOOL_GROUPS_MAPPING.TEXT_TOOLS) {
    return <TextToolStylePalette onToolClick={onToolClick} tools={tools} toolObjects={toolData} />;
  }

  return null;
};

const BaseMultipleChildTool = ({
  activeToolGroup = '',
  toolButtonObjects,
  activeToolName,
  forToolGroup,
  isToolAvailable,
  toggleCheckPopper,
}) => {
  const { t } = useTranslation();
  const toolbarContext = useToolbarContext();
  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);
  const tools = useMemo(
    () => Object.keys(toolButtonObjects).filter((toolName) => toolButtonObjects[toolName].group === forToolGroup),
    [forToolGroup, toolButtonObjects]
  );
  const [toolName, setToolName] = useState(
    (activeToolGroup === forToolGroup && tools.includes(activeToolName)) ? activeToolName : tools[0]
  );
  const [toolDataElement, setToolDataElement] = useState(toolButtonObjects[tools[0]].dataElement);
  const icon = useMemo(() => ICON_MAPPING[toolName], [toolName]);

  const isToolGroupActive = useMemo(() => activeToolGroup === forToolGroup, [activeToolGroup, forToolGroup]);

  useDidUpdate(() => {
    if (tools.includes(activeToolName)) {
      setToolName(activeToolName);
    }
  }, [activeToolName, tools]);

  const onBtnClick = (toolName, isActive) => {
    if (isToolAvailable) {
      switchTool({ toolName, toolGroup: forToolGroup, isActive, eventElementName: toolDataElement });
    } else {
      toggleCheckPopper();
    }
  };

  const onSecondaryBtnClick = (toolName, handleShowPopper) => {
    if (isToolAvailable) {
      handleShowPopper();
      onBtnClick(toolName, false);
    } else {
      toggleCheckPopper();
    }
  };

  const onToolClick = ({ toolName, dataElement }) => {
    const { next } = switchTool({ toolName, toolGroup: forToolGroup, eventElementName: dataElement });
    if (next) {
      setToolName(toolName);
      setToolDataElement(dataElement);
    }
  };

  const renderPopperContent = () => {
    if (
      [TOOL_GROUPS_MAPPING.SHAPE_TOOLS, TOOL_GROUPS_MAPPING.TEXT_TOOLS].some((toolGroup) => toolGroup === forToolGroup)
    ) {
      return renderPopoverContent({ forToolGroup, onToolClick, tools, toolData: toolButtonObjects });
    }

    return null;
  };

  const splitButtonProps = ({ handleShowPopper, ref, visible }) => ({
    shortcutId: toolButtonObjects[toolName]?.dataElement,
    onClick: () => onBtnClick(toolName, isToolGroupActive),
    label: t(DATA_TOOL_MAPPING[forToolGroup].label),
    activeShapeTooltip: t(toolButtonObjects[toolName].title),
    ref,
    isActive: isToolGroupActive,
    icon,
    showArrow: true,
    secondaryOnClick: () => onSecondaryBtnClick(toolName, () => handleShowPopper()),
    isSecondaryActive: visible,
    singleButtonProps: {
      iconSize: 24,
      iconColor: getColor(activeToolName, isToolGroupActive),
      hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
      tooltipProps: { position: 'bottom', content: t(toolButtonObjects[toolName].title) },
      'data-element': DATA_TOOL_MAPPING[forToolGroup].dataElement,
    },
    secondaryButtonProps: { tooltip: { title: t(DATA_TOOL_MAPPING[forToolGroup].secondaryTooltip) } },
  });

  return (
    <ToolbarPopover
      renderPopperContent={renderPopperContent}
      renderChildren={({ handleShowPopper, ref, visible }) => (
        <ToolbarRightSectionItem
          toolName={toolName}
          isSingleButton={false}
          renderAsMenuItem={renderAsMenuItem}
          buttonProps={splitButtonProps({ handleShowPopper, ref, visible })}
        />
      )}
    />
  );
};

BaseMultipleChildTool.propTypes = {
  activeToolGroup: PropTypes.string,
  toolButtonObjects: PropTypes.object.isRequired,
  activeToolName: PropTypes.string.isRequired,
  forToolGroup: PropTypes.oneOf([TOOL_GROUPS_MAPPING.SHAPE_TOOLS, TOOL_GROUPS_MAPPING.TEXT_TOOLS]).isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  activeToolGroup: selectors.getActiveToolGroup(state),
  toolButtonObjects: selectors.getToolButtonObjects(state),
  activeToolName: selectors.getActiveToolName(state),
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(BaseMultipleChildTool);
