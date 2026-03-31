import PropTypes from 'prop-types';
import React from 'react';
import { useMedia } from 'react-use';

import Skeleton from 'lumin-components/Shared/Skeleton';

import { ORGANIZATION_MEMBER_TYPE } from 'constants/organizationConstants';
import { Breakpoints, Colors } from 'constants/styles';

import * as Styled from './OrganizationListSkeleton.styled';

const propTypes = {
  listToShow: PropTypes.string,
};

const defaultProps = {
  listToShow: ORGANIZATION_MEMBER_TYPE.MEMBER,
};

const getColumns = (listToShow) => {
  switch (listToShow) {
    case ORGANIZATION_MEMBER_TYPE.PEOPLE_PENDING_MEMBER:
      return [
        {
          sm: 4,
          xs: 10,
        },
        {
          widthDesktop: 118,
          widthMobile: 118,
          sm: 3,
          xs: 3,
        },
        {
          empty: true,
          sm: 3,
          xs: 3,
        },
        {
          sm: 2,
          xs: 2,
        },
      ];
    case ORGANIZATION_MEMBER_TYPE.PEOPLE_REQUEST_ACCESS:
      return [
        {
          sm: 4,
          xs: 10,
        },
        {
          widthDesktop: 118,
          widthMobile: 118,
          sm: 3,
          xs: 3,
        },
        {
          widthDesktop: 118,
          widthMobile: 118,
          sm: 3,
          xs: 3,
        },
        {
          sm: 2,
          xs: 2,
        },
      ];
    case ORGANIZATION_MEMBER_TYPE.MEMBER:
      return [
        {
          sm: 4,
          xs: 11,
        },
        {
          hideInMobile: true,
          widthDesktop: 118,
          widthMobile: 0,
          sm: 3,
          xs: 3,
        },
        {
          hideInMobile: true,
          widthDesktop: 200,
          widthMobile: 0,
          sm: 4,
          xs: 4,
        },
        {
          sm: 1,
          xs: 1,
        },
      ];
    case ORGANIZATION_MEMBER_TYPE.PEOPLE_MEMBER:
    case ORGANIZATION_MEMBER_TYPE.PEOPLE_GUEST:
    default:
      return [
        {
          sm: 4,
          xs: 11,
        },
        {
          widthDesktop: 118,
          widthMobile: 118,
          sm: 3,
          xs: 3,
        },
        {
          dateJoined: true,
          widthDesktop: 110,
          widthMobile: 92,
          sm: 2,
          xs: 2,
        },
        {
          widthDesktop: 110,
          widthMobile: 92,
          sm: 2,
          xs: 2,
        },
        {
          sm: 1,
          xs: 1,
        },
      ];
  }
};

const OrganizationListSkeleton = ({ listToShow }) => {
  const isMobile = useMedia(`(max-width: ${Breakpoints.sm}px)`);
  const arrayColumn = getColumns(listToShow);
  const numColumns = arrayColumn.length;
  const lastColumnIndex = numColumns - 1;

  const renderTextColumns = () => {
    const textColumns = [];
    for (let i = 1; i < numColumns - 1; i += 1) {
      textColumns.push(
        <Styled.Item
          item
          sm={arrayColumn[i].sm}
          xs={arrayColumn[i].xs}
          $hideInMobile={arrayColumn[i].hideInMobile}
          $dateJoined={arrayColumn[i].dateJoined}
        >
          {!arrayColumn[i].empty && (
            <Skeleton
              key={i}
              variant="text"
              width={isMobile ? arrayColumn[i].widthMobile : arrayColumn[i].widthDesktop}
              height={16}
              color={Colors.NEUTRAL_20}
            />
          )}
        </Styled.Item>
      );
    }
    return textColumns;
  };
  return (
    <Styled.Container>
      {Array.from(Array(6)).map((item, index) => (
        <Styled.Wrapper container key={index}>
          <Styled.Item item sm={arrayColumn[0].sm} xs={arrayColumn[0].xs}>
            <Styled.Avatar>
              <Skeleton variant="circular" width={40} height={40} color={Colors.NEUTRAL_20} />
            </Styled.Avatar>
            <Styled.TextWrapper>
              <Skeleton variant="text" width={isMobile ? 130 : 160} height={20} color={Colors.NEUTRAL_20} />
            </Styled.TextWrapper>
          </Styled.Item>
          {renderTextColumns()}
          <Styled.Item
            $makeRole
            item
            sm={arrayColumn[lastColumnIndex].sm}
            xs={arrayColumn[lastColumnIndex].xs}
            $fullColumns={numColumns === 5}
          >
            <Skeleton variant="rectangular" width={32} height={32} color={Colors.NEUTRAL_20} />
          </Styled.Item>
        </Styled.Wrapper>
      ))}
    </Styled.Container>
  );
};

OrganizationListSkeleton.propTypes = propTypes;
OrganizationListSkeleton.defaultProps = defaultProps;

export default OrganizationListSkeleton;
