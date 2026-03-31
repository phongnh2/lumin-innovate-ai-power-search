export const SOCKET_ON = {
  Common: {
    Connect: 'connect',
    AUTHENTICATED: 'authenticated'
  },
  User: {
    LogOut: 'userLogout',
    AdminDeleteUser: 'adminDeleteUser',
    CompletedDeleteUser: 'completedDeleteUser',
    reactiveUserAccount: 'reactiveUserAccount',
    EnableSocialSignInSuccess: 'enableSocialSignInSuccess',
    forceReload: 'forceReload',
    UserEmailChanged: 'userEmailChanged'
  }
} as const;

export const SOCKET_EMIT = {
  User: {
    JoinRoom: 'joinRoom',
    SignIn: 'userSignIn'
  },
  AUTH: {
    CONNECTION_INIT: 'connection_init'
  }
};
