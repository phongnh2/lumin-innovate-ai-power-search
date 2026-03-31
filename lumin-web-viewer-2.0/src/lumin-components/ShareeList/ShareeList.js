import PropTypes from 'prop-types';
import React, { useState } from 'react';

import InfiniteScroll from 'luminComponents/InfiniteScroll';
import ShareListItem from 'luminComponents/ShareListItem';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { DocumentRole } from 'constants/documentConstants';
import { THEME_MODE } from 'constants/lumin-common';

import * as Styled from './ShareeList.styled';

import styles from './ShareeList.module.scss';

const propTypes = {
  members: PropTypes.array,
  currentUserRole: PropTypes.string,
  handleChangePermission: PropTypes.func,
  handleRemoveMember: PropTypes.func,
  themeMode: PropTypes.oneOf(Object.values(THEME_MODE)),
  loading: PropTypes.bool,
};

const defaultProps = {
  members: [],
  currentUserRole: 'owner',
  handleChangePermission: () => {},
  handleRemoveMember: () => {},
  themeMode: THEME_MODE.LIGHT,
  loading: false,
};

function ShareeList(props) {
  const { t } = useTranslation();

  const [scrollElement, setScrollElement] = useState();

  const { isEnableReskin } = useEnableWebReskin();

  const { members, currentUserRole, handleChangePermission, handleRemoveMember, themeMode, loading } = props;

  const canShare = [DocumentRole.OWNER, DocumentRole.SHARER].includes(currentUserRole.toLowerCase());

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>{t('modalShare.peopleWithAccess')}</h3>
        <InfiniteScroll
          contentProps={{
            className: styles.wrapper,
          }}
          autoHeight
          autoHeightMin={0}
          autoHeightMax={300}
          hasNextPage={false}
          onLoadMore={() => {}}
          setScrollElement={setScrollElement}
        >
          {members.map((member) => (
            <ShareListItem
              key={`m-${member._id}`}
              member={member}
              canShare={canShare}
              handleChangePermission={handleChangePermission}
              handleRemoveMember={handleRemoveMember}
              themeMode={themeMode}
              disabled={loading}
              isEnableReskin={isEnableReskin}
              scrollElement={scrollElement}
            />
          ))}
        </InfiniteScroll>
      </div>
    );
  }
  return (
    <Styled.Container>
      <InfiniteScroll autoHeight autoHeightMin={0} autoHeightMax={300} hasNextPage={false} onLoadMore={() => {}}>
        {members.map((member) => (
          <ShareListItem
            key={`m-${member._id}`}
            member={member}
            canShare={canShare}
            handleChangePermission={handleChangePermission}
            handleRemoveMember={handleRemoveMember}
            themeMode={themeMode}
            disabled={loading}
          />
        ))}
      </InfiniteScroll>
    </Styled.Container>
  );
}
ShareeList.propTypes = propTypes;
ShareeList.defaultProps = defaultProps;

export default React.memo(ShareeList);
