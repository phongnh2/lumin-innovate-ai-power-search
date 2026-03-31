import { checkPersonalDocumentAction } from 'utils/checkDocumentRole';

const withPersonalAuthorization = (document) => (actions) =>
  checkPersonalDocumentAction(document.roleOfDocument.toUpperCase()).includes(actions);

export default withPersonalAuthorization;
