import { IconButton } from 'lumin-ui/kiwi-ui';
import React from 'react';
import { useSelector } from 'react-redux';

import { TOOL_PROPERTIES_VALUE } from '@new-ui/components/LuminLeftPanel/constants';
import useToolProperties from '@new-ui/hooks/useToolProperties';

import selectors from 'selectors';

import { useTranslation } from 'hooks/useTranslation';

import styles from './PanelHeader.module.scss';

const PanelHeader = () => {
  const { t } = useTranslation();
  const toolPropertiesValue = useSelector(selectors.toolPropertiesValue);
  const { closeToolPropertiesFromHeader } = useToolProperties();

  const renderTitle = (_toolPropertiesValue: string) => {
    switch (_toolPropertiesValue) {
      case TOOL_PROPERTIES_VALUE.MERGE:
        return 'viewer.leftPanelEditMode.mergeDocuments';

      case TOOL_PROPERTIES_VALUE.ROTATE:
        return 'viewer.leftPanelEditMode.rotatePages';

      case TOOL_PROPERTIES_VALUE.INSERT:
        return 'viewer.leftPanelEditMode.insertBlankPage';

      case TOOL_PROPERTIES_VALUE.SPLIT_EXTRACT:
        return 'generalLayout.toolProperties.splitAndExtractPage';

      case TOOL_PROPERTIES_VALUE.MOVE:
        return 'viewer.leftPanelEditMode.movePage';

      case TOOL_PROPERTIES_VALUE.DELETE:
        return 'viewer.leftPanelEditMode.deletePage';

      case TOOL_PROPERTIES_VALUE.CROP:
        return 'viewer.leftPanelEditMode.cropPage';

      case TOOL_PROPERTIES_VALUE.EDIT_PDF:
        return 'viewer.formBuildPanel.style';

      case TOOL_PROPERTIES_VALUE.FORM_BUILD:
        return 'generalLayout.toolProperties.formBuilder';

      case TOOL_PROPERTIES_VALUE.MEASURE:
        return 'viewer.measureToolPanel.measureToolProperties';

      default:
        return '';
    }
  };

  const renderCloseIcon = (_toolPropertiesValue: string) => {
    if (_toolPropertiesValue === TOOL_PROPERTIES_VALUE.EDIT_PDF) {
      return null;
    }
    return <IconButton icon="x-sm" size="md" onClick={closeToolPropertiesFromHeader} />;
  };

  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{t(renderTitle(toolPropertiesValue))}</span>
      <div className={styles.rightSection}>{renderCloseIcon(toolPropertiesValue)}</div>
    </div>
  );
};

export default PanelHeader;
