export type Scope =
  | 'openid'
  | 'profile.read'
  | 'profile.settings'
  | 'pdf:files'
  | 'pdf:files.read'
  | 'sign:requests'
  | 'sign:requests.read'
  | 'workspaces.read'
  | 'templates'
  | 'offline_access'
  | 'agreements'
  // deprecated
  | 'settings.configure'
  | 'pdf:circles.read';
export interface ScopeDescription {
  title: string;
  description: string;
  context: 'pdf' | 'sign';
}

export const Scopes: Record<Scope, ScopeDescription> = {
  openid: {
    title: 'View basic account information',
    description: 'view basic information about your Lumin account such as username, email and profile picture.',
    context: 'pdf'
  },
  offline_access: {
    title: 'Access your Lumin account',
    description: 'access your Lumin account information such as your username, email, and profile picture.',
    context: 'pdf'
  },
  'profile.read': {
    title: 'View basic account information',
    description: 'view basic information about your Lumin profile, such as username, email address and profile picture.',
    context: 'pdf'
  },
  'profile.settings': {
    title: 'Manage your account settings',
    description: 'update your account settings',
    context: 'pdf'
  },
  'pdf:files': {
    title: 'Manage your documents',
    description: 'create, update, or delete documents in your Workspace.',
    context: 'pdf'
  },
  'pdf:files.read': {
    title: 'View your documents',
    description: 'view documents in your Workspace.',
    context: 'pdf'
  },
  'sign:requests': {
    title: 'View your signature requests',
    description: 'view signature requests in your Workspace.',
    context: 'sign'
  },
  'sign:requests.read': {
    title: 'View your signature requests',
    description: 'see your Lumin Sign signature requests.',
    context: 'sign'
  },
  'workspaces.read': {
    title: 'View your Workspace information',
    description: 'view your Workspace information.',
    context: 'pdf'
  },
  templates: {
    title: 'Manage your templates',
    description: 'create, update, or delete templates in your Workspace.',
    context: 'pdf'
  },
  agreements: {
    title: 'Manage your agreements',
    description: 'create, update, or delete agreements in your Workspace.',
    context: 'pdf'
  },
  // deprecated
  'settings.configure': {
    title: 'Manage user account settings',
    description: 'update your account settings',
    context: 'pdf'
  },
  'pdf:circles.read': {
    title: 'View your Workspace information',
    description: 'view your Workspace information.',
    context: 'pdf'
  }
};
