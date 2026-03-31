/* eslint-disable class-methods-use-this */
import * as templateApi from 'services/graphServices/template';

class OrganizationTemplateService {
  getAll({ orgId, tab, limit, offset, searchKey, signal }) {
    return templateApi.getOrganizationTemplates({ orgId, tab, limit, offset, searchKey, signal });
  }

  upload({
    file, thumbnail, name, description, orgId, cancelToken, onUploadProgress, isNotify,
  }) {
    return templateApi.uploadOrganizationTemplate({
      file, thumbnail, name, description, orgId, cancelToken, onUploadProgress, isNotify,
    });
  }

  deleteTemplate(input) {
    return templateApi.deleteTemplate(input);
  }

  checkReachDailyTemplateUploadLimit(input) {
    return templateApi.checkReachDailyTemplateUploadLimit(input);
  }
}
const organizationTemplateService = new OrganizationTemplateService();
export default organizationTemplateService;
