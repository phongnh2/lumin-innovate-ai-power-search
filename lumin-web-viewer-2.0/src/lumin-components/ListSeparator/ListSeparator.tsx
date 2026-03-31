import classNames from 'classnames';
import React from 'react';

import './ListSeparator.scss';

interface IListSeparatorProps {
  selectedPage: number;
  currentPage: number;
  renderContent: () => React.ReactNode;
  className?: string;
}

function ListSeparator(props: IListSeparatorProps) {
  const { selectedPage, currentPage, className } = props;
  return (
    <div
      className={classNames(
        'ListSeparator',
        {
          active: selectedPage === currentPage,
        },
        className
      )}
    >
      {props.renderContent()}
    </div>
  );
}

export default ListSeparator;
