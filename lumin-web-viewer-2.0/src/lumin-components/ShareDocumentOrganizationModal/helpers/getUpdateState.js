import { SHARE_DOCUMENT_LIST_TYPE } from 'constants/organizationConstants';

export default (typeList, state) => {
  switch (typeList) {
    case SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL: {
      return {
        type: 'UPDATE_INVITED_BY_EMAIL_LIST',
        stateName: 'invitedByEmailList',
        state: state.invitedByEmailList,
      };
    }
    case SHARE_DOCUMENT_LIST_TYPE.MEMBER: {
      return {
        type: 'UPDATE_MEMBERS',
        stateName: 'members',
        state: state.members,
      };
    }
    case SHARE_DOCUMENT_LIST_TYPE.REQUEST_ACCESS: {
      return {
        type: 'UPDATE_REQUEST_ACCESS_LIST',
        stateName: 'requestAccessList',
        state: state.requestAccessList,
      };
    }
    default:
      throw new Error('Invalid typeList');
  }
};
