import { ChatCircleTextIcon } from '@luminpdf/icons/dist/csr/ChatCircleText';
import { CirclesThreePlusIcon } from '@luminpdf/icons/dist/csr/CirclesThreePlus';
import { FileIcon } from '@luminpdf/icons/dist/csr/File';
import { PenIcon } from '@luminpdf/icons/dist/csr/Pen';
import React from 'react';

export const quickActionCategories = [
  {
    name: 'All',
    translationKey: 'viewer.quickActions.all.title',
    id: 'all',
  },
  {
    name: 'Ask',
    translationKey: 'viewer.quickActions.ask.title',
    id: 'ask',
    icon: <ChatCircleTextIcon />,
  },
  {
    name: 'Insert',
    translationKey: 'viewer.quickActions.insert.title',
    id: 'insert',
    icon: <CirclesThreePlusIcon />,
  },
  {
    name: 'Edit',
    translationKey: 'viewer.quickActions.edit.title',
    id: 'edit',
    icon: <PenIcon />,
  },
  {
    name: 'Organize',
    translationKey: 'viewer.quickActions.organize.title',
    id: 'organize',
    icon: <FileIcon />,
  },
];
