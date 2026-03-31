/* eslint-disable class-methods-use-this */
import * as templateApi from 'services/graphServices/template';

class OrganizationTeamTemplateService {
  getAll({ teamId, limit, offset, searchKey, signal }) {
    return templateApi.getTeamTemplates({ teamId, limit, offset, searchKey, signal });
  }

  upload({
    file, thumbnail, name, teamId, description, cancelToken, onUploadProgress,
  }) {
    return templateApi.uploadTeamTemplate({
      file, thumbnail, name, teamId, description, cancelToken, onUploadProgress,
    });
  }

  deleteTemplate(input) {
    return templateApi.deleteTemplate(input);
  }

  checkReachDailyTemplateUploadLimit(input) {
    return templateApi.checkReachDailyTemplateUploadLimit(input);
  }
}
const organizationTeamTemplateService = new OrganizationTeamTemplateService();
export default organizationTeamTemplateService;
