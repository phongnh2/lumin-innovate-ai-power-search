import { DocumentTemplateQuery } from 'Common/template-methods/DocumentQuery/document-template-query';

import { DocumentTemplateService } from 'Document/DocumentTemplate/documentTemplate.service';
import { EnvironmentService } from 'Environment/environment.service';
import { UserService } from 'User/user.service';

class OrganizationDocumentTemplateQuery extends DocumentTemplateQuery {
  constructor(
    protected readonly _documentTemplateService: DocumentTemplateService,
    protected readonly _userService: UserService,
    protected readonly _environmentService: EnvironmentService,
  ) {
    super(
      _documentTemplateService,
      _userService,
      _environmentService,
    );
  }
}

export { OrganizationDocumentTemplateQuery };
