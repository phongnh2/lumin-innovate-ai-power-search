/* eslint-disable react/prop-types */
import React from 'react';
import { Navigate } from 'react-router';

import { DocumentFolderTypeTab } from 'constants/documentFolderTypeTab';

import DocumentNotFoundComponent from '../../screens/DocumentNotFound';
import OpenLuminLoadable from '../../screens/OpenLumin';
import DocumentLoadableComponent from '../../screens/PersonalDocument';
import ViewerLoadableComponent from '../../screens/Viewer';

const routes = [
  {
    path: '/',
    component: () => <Navigate to="/documents/personal" />,
    exact: true,
    auth: true,
    pageTitle: 'Documents | My Documents',
  },
  {
    path: '/viewer/:documentId',
    component: ViewerLoadableComponent,
    exact: false,
    auth: false,
  },
  {
    path: '/documents/notFound',
    component: DocumentNotFoundComponent,
    exact: true,
    auth: false,
  },
  {
    path: '/documents/:type',
    component: DocumentLoadableComponent,
    exact: true,
    auth: true,
    condition: ({ match }) => {
      const { type = '' } = match.params;
      return Object.values(DocumentFolderTypeTab).includes(type.toLowerCase());
    },
  },
  {
    path: '/documents',
    component: () => <Navigate to="/documents/personal" />,
    exact: true,
    auth: true,
    pageTitle: 'Documents | My Documents',
  },
  {
    path: '/open/lumin',
    component: OpenLuminLoadable,
    exact: true,
    auth: false,
    sidebar: false,
    header: false,
  },
  {
    component: () => <Navigate to="/documents/personal" />,
    exact: true,
    auth: true,
  },
];
export default routes;
