import React from 'react';
import getDocumentSharingPermission from '../getDocumentSharingPermission';
import { DocumentRole } from 'constants/documentConstants';

describe('getDocumentSharingPermission', () => {
  const t = (key) => key;

  it('should return permissions object with correct text', () => {
    const permissions = getDocumentSharingPermission(t);
    expect(permissions[DocumentRole.SPECTATOR].text).toBe('sharePermission.canView');
  });

  it('should return permissions with React icon components', () => {
    const permissions = getDocumentSharingPermission(t);
    expect(React.isValidElement(permissions[DocumentRole.SPECTATOR].icon)).toBe(true);
  });

  it('should return correct roles for each permission', () => {
    const permissions = getDocumentSharingPermission(t);
    expect(permissions[DocumentRole.SPECTATOR].role).toBe(DocumentRole.SPECTATOR);
    expect(permissions[DocumentRole.VIEWER].role).toBe(DocumentRole.VIEWER);
    expect(permissions[DocumentRole.EDITOR].role).toBe(DocumentRole.EDITOR);
    expect(permissions[DocumentRole.SHARER].role).toBe(DocumentRole.SHARER);
  });

  it('should return correct text for each permission', () => {
    const permissions = getDocumentSharingPermission(t);
    expect(permissions[DocumentRole.SPECTATOR].text).toBe('sharePermission.canView');
    expect(permissions[DocumentRole.VIEWER].text).toBe('sharePermission.canComment');
    expect(permissions[DocumentRole.EDITOR].text).toBe('sharePermission.canEdit');
    expect(permissions[DocumentRole.SHARER].text).toBe('sharePermission.canShare');
  });
});
