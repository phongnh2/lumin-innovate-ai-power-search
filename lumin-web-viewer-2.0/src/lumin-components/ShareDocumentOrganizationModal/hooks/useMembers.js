import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { SHARE_DOCUMENT_LIST_TYPE } from 'constants/organizationConstants';

const useMembers = ({ data, defaultType }) => {
  const [listType, setListType] = useState(SHARE_DOCUMENT_LIST_TYPE.MEMBER);
  const getMembers = useCallback(() => {
    switch (listType) {
      case SHARE_DOCUMENT_LIST_TYPE.MEMBER:
        return data.members;
      case SHARE_DOCUMENT_LIST_TYPE.INVITED_EMAIL:
        return data.invitedByEmailList;
      case SHARE_DOCUMENT_LIST_TYPE.REQUEST_ACCESS:
        return data.requestAccessList;

      default:
        throw new Error('Shared member type is invalid.');
    }
  }, [listType, data.members, data.invitedByEmailList, data.requestAccessList]);

  useEffect(() => {
    setListType(defaultType);
  }, [defaultType]);
  return {
    listType,
    setListType,
    getMembers,
  };
};

useMembers.propTypes = {
  data: PropTypes.object.isRequired,
  defaultType: PropTypes.object,
};

useMembers.defaultProps = {
  defaultType: SHARE_DOCUMENT_LIST_TYPE.MEMBER,
};

export default useMembers;
