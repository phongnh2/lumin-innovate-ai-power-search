import { AbstractPermissionFilter, PermissionFilter } from 'Common/builder/DocumentFilterBuilder/permission/permission-filter';

import { DocumentKindEnum, DocumentRoleEnum } from 'Document/document.enum';
import { DocumentTab } from 'graphql.schema';

class PersonalPermissionFilter extends PermissionFilter implements AbstractPermissionFilter<PermissionFilter> {
  constructor() {
    super();
  }

  addTab(tab: DocumentTab): PersonalPermissionFilter {
    switch (tab) {
      case DocumentTab.MY_DOCUMENT: {
        Object.assign(this._filter, {
          refId: this._userId,
          role: DocumentRoleEnum.OWNER,
          workspace: { $exists: false },
        });
        break;
      }
      case DocumentTab.SHARED_WITH_ME: {
        Object.assign(this._filter, {
          refId: this._userId,
          role: { $ne: DocumentRoleEnum.OWNER },
        });
        break;
      }
      case DocumentTab.ORGANIZATION:
        throw new Error('The document tab is not implemented.');
      case DocumentTab.STARRED: {
        // find all teams to include in refId.
        // starred documents are contained in personal document and all shared with me documents
        Object.assign(this._filter, {
          refId: this._userId,
          workspace: { $exists: false },
        });
        break;
      }
      default:
        throw new Error(`The document tab ${tab} is unknown or not supported.`);
    }

    return this;
  }

  addKind(kind: DocumentKindEnum): this {
    Object.assign(this._filter, {
      documentKind: kind,
    });
    return this;
  }
}

export { PersonalPermissionFilter };
