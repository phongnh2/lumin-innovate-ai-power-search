import React, { useContext } from 'react';

import Loading from 'lumin-components/Loading';
import ShareeList from 'lumin-components/ShareeList';

import { useEnableWebReskin, useThemeMode } from 'hooks';

import SharedMemberType from '../SharedMemberType';
import * as Styled from '../ShareModal.styled';
import { ShareModalContext } from '../ShareModalContext';

import styles from './MemberList.module.scss';

const MemberList = () => {
  const {
    members,
    currentDocument,
    userRole,
    handleChangePermission,
    handleRemoveMember,
    handleTransferFileByCheckLuminStorage,
    getSharees,
    isTransfering,
    requestAccessList,
  } = useContext(ShareModalContext);
  const themeMode = useThemeMode();
  const { isEnableReskin } = useEnableWebReskin();

  const renderList = () =>
    requestAccessList.loading || !members.length ? (
      <Loading className={isEnableReskin && styles.loading} useReskinCircularProgress={isEnableReskin} normal />
    ) : (
      <ShareeList
        members={members}
        documentId={currentDocument._id}
        currentUserRole={userRole}
        handleChangePermission={handleChangePermission}
        handleRemoveMember={handleRemoveMember}
        handleTransferFileByCheckLuminStorage={handleTransferFileByCheckLuminStorage}
        reloadRequestList={getSharees}
        isTransfering={isTransfering}
        type={SharedMemberType.INVITED_LIST}
        themeMode={themeMode}
        loading={requestAccessList.loading}
      />
    );

  if (isEnableReskin) {
    return renderList();
  }

  return (
    <Styled.MemberListContainer>
      <Styled.ShareesListContainer>{renderList()}</Styled.ShareesListContainer>
    </Styled.MemberListContainer>
  );
};

MemberList.propTypes = {};

export default MemberList;
