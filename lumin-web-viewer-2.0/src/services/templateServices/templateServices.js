/// <reference path="./templateServices.d.ts" />

/* eslint-disable class-methods-use-this */
import * as templateApi from 'services/graphServices/template';
import organizationServices from 'services/organizationServices';

import { ORG_TEAM_ROLE } from 'constants/organizationConstants';
import { TEMPLATE_TABS, TEMPLATE_TYPE } from 'constants/templateConstant';

import organizationTemplateService from './organization';
import personalTemplateService from './personal';
import teamTemplateService from './team';

const serviceMapping = {
  [TEMPLATE_TABS.PERSONAL]: personalTemplateService,
  [TEMPLATE_TABS.ORGANIZATION]: organizationTemplateService,
  [TEMPLATE_TABS.TEAM]: teamTemplateService,
};
class TemplateService {
  from(type) {
    return serviceMapping[type];
  }

  getTemplateById(templateId, { withSignedUrl = false, increaseView = false } = {}) {
    return templateApi.getTemplateById(templateId, { withSignedUrl, increaseView });
  }

  createDocument({ templateId, notify = false }) {
    return templateApi.useTemplate({ templateId, notify });
  }

  editTemplate({ template, thumbnailFile }) {
    return templateApi.editTemplate({ template, thumbnailFile });
  }

  createTemplateBaseOnDocument({
    documentId, destinationId, destinationType, templateData, files, isNotify, isRemoveThumbnail,
  }) {
    return templateApi.createTemplateBaseOnDocument({
      documentId, destinationId, destinationType, templateData, files, isNotify, isRemoveThumbnail,
    });
  }

  isManagerOfOrgTemplate(templateLocation, userRole) {
    return templateLocation === TEMPLATE_TYPE.ORGANIZATION && organizationServices.isManager(userRole);
  }

  isManagerOfTeamTemplate(templateLocation, userRole) {
    return templateLocation === TEMPLATE_TYPE.TEAM && userRole === ORG_TEAM_ROLE.ADMIN.toLowerCase();
  }
}

const templateService = new TemplateService();
export default templateService;
