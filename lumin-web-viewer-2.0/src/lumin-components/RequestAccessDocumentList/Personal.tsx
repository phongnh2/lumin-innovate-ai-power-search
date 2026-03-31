/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';

import useMultiSelect from 'lumin-components/RequestAccessSection/hooks/useMultiSelect';
import { ShareListItemContainer } from 'lumin-components/ShareListItem';

import { useThemeMode, useInfinityScroll, useEnableWebReskin } from 'hooks';

import { DocumentRole, MAX_REQUEST_ACCESS_ITEMS } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';

import { Header, ScrollContainer, FetchMoreLoading } from './components';
import { RequestPermissionText, TRequestPermission } from './constants';
import { getPrimaryText } from './helpers';
import { useMultipleAcceptReject } from './hooks';

import * as Styled from './RequestAccessDocumentList.styled';

type RequestedListType = {
  _id: string;
  name: string;
  avatarRemoteId: string;
  email: string;
  teamName: string;
  type: string;
  role: TRequestPermission;
};

type Props = {
  targetRequest: RequestedListType;
  requestedList: RequestedListType[];
  document: IDocumentBase;
  reloadRequestList: () => void;
  currentUserRole: string;
  handleTransferFileByCheckLuminStorage: () => void;
  isTransfering: boolean;
  total: number;
  fullList?: boolean;
  fetchMore: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  openHitDocStackModal: (action: string) => void;
};

const Personal = ({
  targetRequest,
  requestedList,
  document,
  reloadRequestList,
  currentUserRole,
  handleTransferFileByCheckLuminStorage,
  isTransfering,
  total,
  fullList,
  fetchMore,
  hasNextPage,
  isFetching,
  openHitDocStackModal,
}: Props): JSX.Element => {
  const themeMode = useThemeMode();
  const { setLastElement } = useInfinityScroll({ executer: fetchMore });
  const { selected, onCheckboxChange, selectAll, isSelectingAll, isIndeterminate, clear } = useMultiSelect(
    requestedList.map((item) => item._id)
  );
  const { accept, reject, isAccepting, isRejecting } = useMultipleAcceptReject({
    documentId: document._id,
    selected,
    refetch: reloadRequestList,
    openHitDocStackModal,
  });
  const canShare = [DocumentRole.OWNER, DocumentRole.SHARER].includes(currentUserRole);
  const showTargetRequest = !isEmpty(targetRequest) && !fullList;
  const currentItemProcessing = (memberId: string): boolean =>
    (isAccepting || isRejecting) && selected.includes(memberId);

  const { isEnableReskin } = useEnableWebReskin();

  const renderItem = ({
    member,
    shouldHighlight = false,
  }: {
    member: RequestedListType;
    shouldHighlight?: boolean;
  }): JSX.Element => (
    <ShareListItemContainer.Personal
      key={member._id}
      document={document}
      member={member}
      reloadRequestList={reloadRequestList}
      handleTransferFileByCheckLuminStorage={handleTransferFileByCheckLuminStorage}
      isTransfering={isTransfering}
      openHitDocStackModal={openHitDocStackModal}
    >
      {({
        handleAccept,
        handleReject,
        requestLoading,
      }: {
        handleAccept: () => void;
        handleReject: () => void;
        requestLoading: boolean;
      }) => (
        <Styled.PersonalItem
          $fullList={fullList}
          member={member}
          canShare={canShare}
          primaryText={getPrimaryText({
            name: member.name,
            requestedPermission: RequestPermissionText[member.role],
            isReskin: isEnableReskin,
          })}
          handleAccept={handleAccept}
          handleReject={handleReject}
          requestLoading={requestLoading}
          themeMode={themeMode}
          highlight={shouldHighlight}
          checkboxProps={
            fullList && {
              disabled: requestLoading || currentItemProcessing(member._id),
              checked: selected.includes(member._id),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => onCheckboxChange(e, member._id),
            }
          }
          disabled={requestLoading || isFetching || currentItemProcessing(member._id)}
          isEnableReskin={isEnableReskin}
        />
      )}
    </ShareListItemContainer.Personal>
  );

  useEffect(() => {
    clear();
  }, [isFetching]);

  return (
    <>
      {fullList && (
        <Header
          currentSelect={selected.length}
          total={total}
          totalOnView={requestedList.length}
          onChange={selectAll}
          indeterminate={isIndeterminate}
          checked={isSelectingAll}
          acceptMultiple={accept}
          rejectMultiple={reject}
          isAccepting={isAccepting}
          isRejecting={isRejecting}
        />
      )}
      <ScrollContainer fullList={fullList} isReskin={isEnableReskin}>
        <Styled.List $fullList={fullList} $isReskin={isEnableReskin}>
          {showTargetRequest && renderItem({ member: targetRequest, shouldHighlight: true })}
          {requestedList
            .slice(0, fullList ? requestedList.length : MAX_REQUEST_ACCESS_ITEMS)
            .map((member) => renderItem({ member }))}
          {fullList && hasNextPage && <FetchMoreLoading setLastElement={setLastElement} />}
        </Styled.List>
      </ScrollContainer>
    </>
  );
};

Personal.defaultProps = {
  fullList: false,
};

export default Personal;
