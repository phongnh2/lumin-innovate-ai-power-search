import * as templateApi from 'services/graphServices/template';

/* eslint-disable class-methods-use-this */
class PersonalTemplateService {
  getAll({ limit, offset, searchKey, signal }) {
    return templateApi.getPersonalTemplate({ limit, offset, searchKey, signal });
  }

  upload({
    file, thumbnail, name, description, cancelToken, onUploadProgress,
  }) {
    return templateApi.uploadPersonalTemplate({
      file, thumbnail, name, description, cancelToken, onUploadProgress,
    });
  }

  deleteTemplate(input) {
    return templateApi.deleteTemplate(input);
  }

  checkReachDailyTemplateUploadLimit(input) {
    return templateApi.checkReachDailyTemplateUploadLimit(input);
  }
}
export default new PersonalTemplateService();
