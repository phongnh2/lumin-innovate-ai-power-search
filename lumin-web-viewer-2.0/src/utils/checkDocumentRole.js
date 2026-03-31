import { DocumentActions, DocumentTemplateActions } from 'constants/documentConstants';

export default function checkDocumentRole(role) {
  // INDIVIDUAL DOCUMENT
  // VIEWER
  const VIEWER = ['view', 'open', 'comment', 'share', 'remove', 'makeStar'];
  // EDITOR
  const EDITOR = [...VIEWER, 'edit'];
  // SHARER
  const SHARER = [...EDITOR, 'rename', 'editShareSetting'];
  // OWNER
  const OWNER = [...SHARER, 'move', 'remove', 'editShareSetting', 'createAsTemplate'];

  // TEAM DOCUMENT
  // MEMBER
  const MEMBER = ['upload', 'view', 'open', 'comment', 'edit', 'share', 'makeStar'];
  // MODERATOR
  const MODERATOR = [...MEMBER, 'rename', 'editShareSetting', 'createAsTemplate'];
  // ADMIN, OWNER
  const ADMIN = [...MODERATOR, 'remove', 'move', 'buyPremium', 'viewInvoices', 'changeCard'];

  switch (role.toUpperCase()) {
    case 'EDITOR': return EDITOR;
    case 'SHARER': return SHARER;
    case 'OWNER': return OWNER;
    case 'MEMBER': return MEMBER;
    case 'MODERATOR': return MODERATOR;
    case 'ADMIN': return ADMIN;
    default: return VIEWER;
  }
}

export function checkPersonalDocumentAction(roleOfDocument) {
  const VIEWER = [DocumentActions.View,
    DocumentActions.Open,
    DocumentActions.MakeACopy,
    DocumentActions.CopyLink,
    DocumentActions.Share,
    DocumentActions.Remove,
    DocumentActions.MarkFavorite,
    DocumentActions.MakeOffline,
    DocumentActions.CreateAsTemplate,
    DocumentActions.UploadToLumin,
  ];

  const EDITOR = VIEWER;
  const SHARER = [...EDITOR, DocumentActions.Rename];
  const OWNER = [
    ...SHARER,
    DocumentActions.Move,
    DocumentTemplateActions.PreviewTemplate,
    DocumentTemplateActions.CopyLinkTemplate,
    DocumentTemplateActions.UseTemplate,
    DocumentTemplateActions.EditTemplate,
    DocumentTemplateActions.DeleteTemplate,
  ];

  const MEMBER = [
    DocumentActions.View,
    DocumentActions.Open,
    DocumentActions.Share,
    DocumentActions.MarkFavorite,
    DocumentActions.MakeOffline,
    DocumentActions.CreateAsTemplate,
  ];
  const MODERATOR = [...MEMBER, DocumentActions.Rename];
  const ADMIN = [...MODERATOR, DocumentActions.Remove];

  switch (roleOfDocument.toUpperCase()) {
    case 'EDITOR': return EDITOR;
    case 'SHARER': return SHARER;
    case 'OWNER': return OWNER;
    case 'MEMBER': return MEMBER;
    case 'MODERATOR': return MODERATOR;
    case 'ADMIN': return ADMIN;
    default: return VIEWER;
  }
}
