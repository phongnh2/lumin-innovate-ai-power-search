/* eslint-disable @typescript-eslint/ban-ts-comment */
import { isEmpty } from 'lodash';
import React, { useEffect } from 'react';
import { shallowEqual, useSelector } from 'react-redux';

// @ts-ignore
import selectors from 'selectors';

import RequestAccessButtonGroup from 'lumin-components/RequestAccessButtonGroup';
import useMultiSelect from 'lumin-components/RequestAccessSection/hooks/useMultiSelect';
import { ShareListItemContainer } from 'lumin-components/ShareListItem';

import { useEnableWebReskin, useInfinityScroll } from 'hooks';

import organizationServices from 'services/organizationServices';

import { DocumentRole, MAX_REQUEST_ACCESS_ITEMS } from 'constants/documentConstants';

import { IDocumentBase } from 'interfaces/document/document.interface';
import { IUser } from 'interfaces/user/user.interface';

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
  userId: string;
};

type Props = {
  targetRequest: RequestedListType;
  requestedList: RequestedListType[];
  reloadRequestList: () => void;
  total: number;
  currentDocument: IDocumentBase;
  ownerId: string;
  currentUserRole: string;
  fullList?: boolean;
  fetchMore: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  openHitDocStackModal: (action: string) => void;
};

const Organization = ({
  targetRequest,
  requestedList,
  reloadRequestList,
  currentDocument,
  ownerId,
  currentUserRole,
  fullList,
  total,
  fetchMore,
  hasNextPage,
  isFetching,
  openHitDocStackModal,
}: Props): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const currentUser: IUser = useSelector(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    selectors.getCurrentUser,
    shallowEqual
  );
  const { roleOfDocument, _id: documentId } = currentDocument;
  const { setLastElement } = useInfinityScroll({ executer: fetchMore });
  const { selected, onCheckboxChange, selectAll, isSelectingAll, isIndeterminate, clear } = useMultiSelect(
    requestedList.map((item) => item._id)
  );
  const { accept, reject, isAccepting, isRejecting } = useMultipleAcceptReject({
    documentId,
    selected,
    refetch: reloadRequestList,
    openHitDocStackModal,
  });
  const isManager = organizationServices.isManager(currentUserRole);
  const isSharer = [DocumentRole.SHARER, DocumentRole.OWNER].includes(roleOfDocument.toLowerCase());
  const currentItemProcessing = (memberId: string): boolean =>
    (isAccepting || isRejecting) && selected.includes(memberId);

  const isMe = ({ userId, _id }: { userId: string; _id: string }): boolean => [userId, _id].includes(currentUser._id);

  const { isEnableReskin } = useEnableWebReskin();

  const renderItem = ({
    member,
    shouldHighlight = false,
  }: {
    member: RequestedListType;
    shouldHighlight?: boolean;
  }): JSX.Element => (
    <ShareListItemContainer.Organization
      key={member._id}
      currentDocument={currentDocument}
      member={member}
      reloadRequestList={reloadRequestList}
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
        <Styled.OrgItem
          // @ts-ignore
          $fullList={fullList}
          isShowUserRole={false}
          selfControl
          key={member.email}
          isOwner={ownerId === member.userId}
          user={member}
          isMe={isMe(member)}
          primaryText={getPrimaryText({
            name: member.name,
            requestedPermission: RequestPermissionText[member.role],
            isReskin: isEnableReskin,
          })}
          highlight={shouldHighlight}
          rightElement={
            (isSharer || isManager) && (
              <RequestAccessButtonGroup
                loading={requestLoading}
                handleAccept={handleAccept}
                handleReject={handleReject}
              />
            )
          }
          isRequestAccess
          checkboxProps={
            fullList && {
              disabled: requestLoading || currentItemProcessing(member._id),
              checked: selected.includes(member._id),
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => onCheckboxChange(e, member._id),
            }
          }
          disabled={requestLoading || isFetching || currentItemProcessing(member._id)}
          isReskin={isEnableReskin}
        />
      )}
    </ShareListItemContainer.Organization>
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
          {!isEmpty(targetRequest) && renderItem({ member: targetRequest, shouldHighlight: true })}
          {requestedList
            .slice(0, fullList ? requestedList.length : MAX_REQUEST_ACCESS_ITEMS)
            .map((item) => renderItem({ member: item }))}
          {fullList && hasNextPage && <FetchMoreLoading setLastElement={setLastElement} />}
        </Styled.List>
      </ScrollContainer>
    </>
  );
};

Organization.defaultProps = {
  fullList: false,
};

export default Organization;
