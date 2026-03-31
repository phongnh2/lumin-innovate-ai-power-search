import { IDocumentBase } from 'interfaces/document/document.interface';
import { DocumentPermissionBase } from '../DocumentPermissions/base';
import { DOCUMENT_ROLES } from 'constants/lumin-common';

class TestPermission extends DocumentPermissionBase {
  canUpdateShareSetting(): void {}
}

const makeDoc = (role: string) => ({ roleOfDocument: role });

describe('DocumentPermissionBase (simple test)', () => {
  let inst: TestPermission;

  beforeEach(() => {
    inst = new TestPermission();
  });

  test('createChecker sets document', () => {
    const doc = makeDoc('editor');
    inst.createChecker({ document: doc as IDocumentBase });
    expect(inst.document).toBe(doc);
  });

  test('getDocumentRole returns upper-case', () => {
    inst.createChecker({ document: makeDoc('viewer') as IDocumentBase });
    expect(inst.getDocumentRole()).toBe('VIEWER');
  });

  test('isOwner', () => {
    inst.createChecker({ document: makeDoc(DOCUMENT_ROLES.OWNER) as IDocumentBase });
    expect(inst.isOwner()).toBe(true);
  });

  test('canShare', () => {
    inst.createChecker({ document: makeDoc(DOCUMENT_ROLES.OWNER) as IDocumentBase });
    expect(inst.canShare()).toBe(true);
  });

  test('canComment', () => {
    inst.createChecker({ document: makeDoc('UNKNOWN') as IDocumentBase });
    expect(inst.canComment()).toBe(false);
  });

  test('hasSharePermission', () => {
    inst.createChecker({ document: makeDoc(DOCUMENT_ROLES.SHARER) as IDocumentBase });
    expect(inst.hasSharePermission()).toBe(true);

    inst.createChecker({ document: makeDoc(DOCUMENT_ROLES.OWNER) as IDocumentBase });
    expect(inst.hasSharePermission()).toBe(false);
  });
});
