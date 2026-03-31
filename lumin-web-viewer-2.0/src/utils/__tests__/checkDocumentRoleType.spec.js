import checkDocumentRoleType from '../checkDocumentRoleType';

describe('checkDocumentRoleType', () => {
  it('checkDocumentRoleType', () => {
    expect(checkDocumentRoleType('owner')).toBe('individual');
    expect(checkDocumentRoleType('member')).toBe('teams');
  });
});