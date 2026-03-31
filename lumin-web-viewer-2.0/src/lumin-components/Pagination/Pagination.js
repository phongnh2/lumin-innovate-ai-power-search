import classNames from 'classnames';
import { IconButton, Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import Icomoon from 'luminComponents/Icomoon';

import { Colors } from 'constants/styles';

import PaginationButton from './PaginationButton';

import * as Styled from './Pagination.styled';

import styles from './Pagination.module.scss';

const propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  onPageSelected: PropTypes.func,
  disabled: PropTypes.bool,
  isReskin: PropTypes.bool,
};

const defaultProps = {
  currentPage: 1,
  totalPages: 0,
  onPageSelected: () => {},
  disabled: false,
  isReskin: false,
};

const Pagination = ({ currentPage, totalPages, onPageSelected, disabled, isReskin }) => {
  const onSelectPage = useCallback(
    (page) => {
      if (page !== '...') {
        onPageSelected(page);
      }
    },
    [onPageSelected]
  );

  const renderPageButton = (page, shouldDisableButton = false) => {
    const isActivated = page === currentPage;
    const isDisabled = disabled || shouldDisableButton;
    if (isReskin) {
      if (page === '...') {
        return (
          <p key={page} className={styles.dots}>
            {page}
          </p>
        );
      }

      return (
        <Button
          key={page}
          variant="text"
          disabled={isDisabled}
          onClick={() => onSelectPage(page)}
          className={classNames(styles.pageButton, { [styles.active]: isActivated })}
        >
          {page}
        </Button>
      );
    }

    return (
      <PaginationButton active={isActivated} disabled={isDisabled} key={page} onClick={() => onSelectPage(page)}>
        {page}
      </PaginationButton>
    );
  };

  const getPaging = () => {
    if (currentPage === 1) {
      return [1, 2, 3];
    }
    if (currentPage === totalPages) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const currentRegion = getPaging().filter((page) => page >= 1 && page <= totalPages);
  const last = currentRegion[currentRegion.length - 1];

  if (isReskin) {
    return (
      <div className={styles.container}>
        <IconButton
          icon="chevron-left-md"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageSelected(currentPage - 1)}
        />

        {!currentRegion.some((page) => page === 1) && renderPageButton(1)}
        {currentRegion[0] - 1 === 2 && (
          <IconButton disabled={disabled} onClick={() => onPageSelected(currentRegion[0] - 1)}>
            {currentRegion[0] - 1}
          </IconButton>
        )}
        {currentRegion[0] - 1 > 2 && renderPageButton('...', true)}
        {currentRegion.map((page) => renderPageButton(page))}
        {totalPages - last === 2 && renderPageButton(last + 1)}
        {totalPages - last > 2 && renderPageButton('...', true)}

        {Boolean(totalPages) && !currentRegion.some((page) => page === totalPages) && renderPageButton(totalPages)}
        <IconButton
          icon="chevron-right-md"
          disabled={Boolean(disabled || !totalPages || currentPage === totalPages)}
          onClick={() => onPageSelected(currentPage + 1)}
        />
      </div>
    );
  }

  return (
    <Styled.Container>
      <PaginationButton disabled={disabled || currentPage === 1} onClick={() => onPageSelected(currentPage - 1)}>
        <Icomoon className="prev-page" size={10} color={Colors.NEUTRAL_60} />
      </PaginationButton>

      {!currentRegion.some((page) => page === 1) && renderPageButton(1)}
      {currentRegion[0] - 1 === 2 && (
        <PaginationButton disabled={disabled} onClick={() => onPageSelected(currentRegion[0] - 1)}>
          {currentRegion[0] - 1}
        </PaginationButton>
      )}
      {currentRegion[0] - 1 > 2 && renderPageButton('...', true)}
      {currentRegion.map((page) => renderPageButton(page))}
      {totalPages - last === 2 && renderPageButton(last + 1)}
      {totalPages - last > 2 && renderPageButton('...', true)}

      {Boolean(totalPages) && !currentRegion.some((page) => page === totalPages) && renderPageButton(totalPages)}
      <PaginationButton
        disabled={Boolean(disabled || !totalPages || currentPage === totalPages)}
        onClick={() => onPageSelected(currentPage + 1)}
      >
        <Icomoon className="next-page" size={10} color={Colors.NEUTRAL_60} />
      </PaginationButton>
    </Styled.Container>
  );
};

Pagination.propTypes = propTypes;
Pagination.defaultProps = defaultProps;

export default Pagination;
