import PropTypes from 'prop-types';
import React from 'react';

import SettingSection from 'lumin-components/SettingSection';

import { useTranslation } from 'hooks';

import { teamServices } from 'services';

import { WorkspaceTemplate } from 'constants/workspaceTemplate';

const getTooltipText = (t) => ({
  [WorkspaceTemplate.ORGANIZATION_TEAM]: t('teamInsight.tooltipTextTeam'),
  [WorkspaceTemplate.PERSONAL]: t('teamInsight.tooltipTextPersonal'),
});
const getDescriptionText = (t) => ({
  [WorkspaceTemplate.ORGANIZATION_TEAM]: t('teamInsight.descriptionTextTeam'),
  [WorkspaceTemplate.PERSONAL]: t('teamInsight.descriptionTextPersonal'),
});

function TeamTemplateSetting({
  team,
  updateTeam,
}) {
  const { t } = useTranslation();
  const onUpdate = async (value) => {
    const workspace = value ? WorkspaceTemplate.PERSONAL : WorkspaceTemplate.ORGANIZATION_TEAM;
    const updatedTeam = await teamServices.updateTeamSettings(team._id, { templateWorkspace: workspace });
    updateTeam(updatedTeam);
  };
  const { templateWorkspace } = team.settings;
  const isCloneToPersonal = templateWorkspace === WorkspaceTemplate.PERSONAL;

  const descriptionText = getTooltipText(t);
  const tooltipText = getDescriptionText(t);

  return (
    <SettingSection.TemplateSettings
      text={descriptionText[templateWorkspace]}
      tooltip={tooltipText[templateWorkspace]}
      defaultValue={isCloneToPersonal}
      onUpdate={onUpdate}
    />
  );
}

TeamTemplateSetting.propTypes = {
  team: PropTypes.object.isRequired,
  updateTeam: PropTypes.func.isRequired,
};

export default TeamTemplateSetting;
