import { Tabs } from 'lumin-ui/kiwi-ui';
import React, { useContext, useEffect } from 'react';

import Tooltip from '@new-ui/general-components/Tooltip';

import core from 'core';

import Icomoon from 'lumin-components/Icomoon';

import { useTranslation } from 'hooks/useTranslation';

import { FORM_BUILD_TABS } from 'constants/formBuildTool';
import { TOOLS_NAME } from 'constants/toolsName';

import * as Styled from '../FormBuilder.styled';
import FormBuilderContext from '../formBuilderContext';

const FORM_BUILD_TOOLS = [TOOLS_NAME.CHECK_BOX, TOOLS_NAME.RADIO, TOOLS_NAME.TEXT_FIELD, TOOLS_NAME.SIGNATURE_FIELD];

const useToolModeUpdate = ({ onTabsValueChange }) => {
  const isFormBuildTool = (toolName) => FORM_BUILD_TOOLS.includes(toolName);

  useEffect(() => {
    const onToolModeUpdated = (newTool, oldTool) => {
      const hasSwitchedFromFormBuildTool = isFormBuildTool(oldTool.name) && !isFormBuildTool(newTool.name);
      if (hasSwitchedFromFormBuildTool) {
        onTabsValueChange({ id: '', toolName: null });
      }
    };
    core.addEventListener('toolModeUpdated', onToolModeUpdated);
    return () => {
      core.removeEventListener('toolModeUpdated', onToolModeUpdated);
    };
  }, []);
};

const Header = () => {
  const { t } = useTranslation();
  const { tabValue, onTabsValueChange } = useContext(FormBuilderContext);

  const onTabsChange = (_id) => {
    const { toolName } = FORM_BUILD_TABS.find(({ id }) => id === _id);
    onTabsValueChange({ id: _id, toolName });
  };

  useToolModeUpdate({ onTabsValueChange });

  return (
    <Styled.HeaderWrapper>
      <Styled.Title>{t('viewer.formBuildPanel.insertFields')}</Styled.Title>

      <Styled.TabsWrapper>
        <Tabs variant="primary" value={tabValue} onChange={onTabsChange}>
          <Tabs.List grow>
            {FORM_BUILD_TABS.map(({ id, newIcon: icon, tooltipLabel, label, ...data }) => (
              <Tooltip title={t(tooltipLabel)} key={label}>
                <Tabs.Tab key={id} value={id} data-lumin-btn-name={data['data-lumin-btn-name']}>
                  <Icomoon style={{ display: 'block' }} size={24} className={icon} />
                </Tabs.Tab>
              </Tooltip>
            ))}
          </Tabs.List>
        </Tabs>
      </Styled.TabsWrapper>
    </Styled.HeaderWrapper>
  );
};

export default Header;
