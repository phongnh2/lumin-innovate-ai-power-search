import React from 'react';

import Skeleton from 'lumin-components/Shared/Skeleton';
import * as LeftSidebarStyled from 'lumin-components/LeftSidebar/LeftSidebar.styled';

const dummies = Array.from(Array(4).keys());

function SidebarMenuLoading() {
  return (
    <div>
      <LeftSidebarStyled.TitleGroup>
        <Skeleton variant="text" height={20} width={80} />
      </LeftSidebarStyled.TitleGroup>
      <LeftSidebarStyled.ListLoading>
        {dummies.map((item) => (
          <Skeleton key={item} variant="text" height={24} />
        ))}
      </LeftSidebarStyled.ListLoading>
    </div>
  );
}

export default SidebarMenuLoading;
