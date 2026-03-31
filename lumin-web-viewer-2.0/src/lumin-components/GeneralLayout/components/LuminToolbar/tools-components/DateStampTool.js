import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import { switchTool } from 'lumin-components/GeneralLayout/components/LuminToolbar/utils.js';
import withValidUserCheck from 'luminComponents/GeneralLayout/HOCs/withValidUserCheck';
import ToolbarRightSectionItem from 'luminComponents/ToolbarRightSection/ToolbarRightSectionItem';

import { useTranslation } from 'hooks';

import UserEventConstants from 'constants/eventConstants';

import { useToolbarContext } from '../components/ToolbarContext';
import { ToolbarItemContext } from '../components/ToolbarItem';

export const DateStampTool = ({ activeToolName, isToolAvailable, toggleCheckPopper, toolName }) => {
  const isToolActive = useMemo(() => activeToolName === 'AnnotationCreateDateFreeText', [activeToolName]);

  const { t } = useTranslation();

  const toolbarContext = useToolbarContext();

  const { collapsibleOrder, renderAsMenuItem } = useContext(ToolbarItemContext);

  const onBtnClick = () => {
    if (isToolAvailable) {
      switchTool({
        isActive: isToolActive,
        toolName: 'AnnotationCreateDateFreeText',
      });
    } else {
      toggleCheckPopper();
    }
  };

  const singleButtonProps = {
    onClick: onBtnClick,
    icon: 'md_date_stamp',
    iconSize: 24,
    dataElement: 'dateFreeTextToolButton',
    tooltipProps: { position: 'bottom', content: t('annotation.dateStamp') },
    label: t('annotation.date'),
    hideLabelOnSmallScreen: toolbarContext.collapsedItem > collapsibleOrder,
    isActive: isToolActive,
    'data-lumin-btn-name': UserEventConstants.Events.HeaderButtonsEvent.DATE_STAMP,
  };

  return (
    <ToolbarRightSectionItem
      isSingleButton
      toolName={toolName}
      renderAsMenuItem={renderAsMenuItem}
      buttonProps={singleButtonProps}
    />
  );
};

DateStampTool.propTypes = {
  toolName: PropTypes.string.isRequired,
  isToolAvailable: PropTypes.bool.isRequired,
  toggleCheckPopper: PropTypes.func.isRequired,
  activeToolName: PropTypes.string.isRequired,
};

DateStampTool.defaultProps = {};

const mapStateToProps = (state) => ({ activeToolName: selectors.getActiveToolName(state) });

const mapDispatchToProps = {};

export default withValidUserCheck(
  connect(mapStateToProps, mapDispatchToProps)(DateStampTool),
  'AnnotationCreateDateFreeText'
);
