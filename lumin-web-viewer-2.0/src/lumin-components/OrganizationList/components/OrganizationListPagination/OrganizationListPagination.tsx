import { Icomoon, Select } from 'lumin-ui/kiwi-ui';
import React, { useMemo } from 'react';
import zenscroll from 'zenscroll';

import MaterialSelect from 'lumin-components/MaterialSelect';
import Pagination from 'lumin-components/Pagination';

import { useEnableWebReskin, useTranslation } from 'hooks';

import { Colors } from 'constants/styles';

import * as Styled from './OrganizationListPagination.styled';

import styles from './OrganizationListPagination.module.scss';

const arrowPagingStyles = {
  size: 8,
  color: Colors.NEUTRAL_60,
};

const pageLimitOptions = [
  { name: '10', value: 10 },
  { name: '20', value: 20 },
  { name: '30', value: 30 },
];

interface OrganizationListPaginationProps {
  limit: number;
  setLimit: (limit: number) => void;
  selectedPage: number;
  setSelectedPage: (page: number) => void;
  totalItem: number;
  defaultPage: number;
}

const OrganizationListPagination = (props: OrganizationListPaginationProps) => {
  const { selectedPage, limit, totalItem, defaultPage, setLimit, setSelectedPage } = props;

  const { t } = useTranslation();
  const { isEnableReskin } = useEnableWebReskin();

  const classes = Styled.useStyled();

  const totalPages = useMemo(() => Math.ceil(totalItem / limit), [totalItem, limit]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onChangePageLimit = (pageLimit: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const value = Number(pageLimit.value);
    setLimit(value);
    setSelectedPage(defaultPage);
  };

  const handleSelectPage = (page: number) => {
    setSelectedPage(page - 1);
    zenscroll.toY(0, 300);
  };

  const showEntry = useMemo(() => {
    const key = totalItem === 1 ? 'memberPage.showEntry' : 'memberPage.showEntries';

    return t(key, {
      number1: selectedPage * limit + 1,
      number2: Math.min((selectedPage + 1) * limit, totalItem),
      totalItem,
    });
  }, [selectedPage, limit, totalItem, t]);

  if (isEnableReskin) {
    return (
      <div className={styles.container}>
        <div className={styles.pageLimit}>
          <span className={styles.paginationText}>{t('common.show')}</span>
          <Select
            size="sm"
            withScrollArea={false}
            value={String(limit)}
            renderOption={(item) => item.option.label}
            data={pageLimitOptions.map((option) => option.name)}
            onChange={(_, option) => onChangePageLimit(option)}
            classNames={{
              wrapper: styles.pageLimitSelect,
              dropdown: styles.pageLimitSelectDropdown,
              input: styles.pageLimitSelectInput,
              option: styles.pageLimitSelectOption,
            }}
            rightSection={<Icomoon type="caret-down-filled-sm" />}
          />
        </div>
        <div className={styles.pagination}>
          <Pagination
            isReskin
            currentPage={selectedPage + 1}
            totalPages={totalPages}
            onPageSelected={handleSelectPage}
          />
        </div>
        <div className={styles.paginationInfo}>
          <span className={styles.paginationText}>{showEntry}</span>
        </div>
      </div>
    );
  }

  return (
    <Styled.PaginationContainer container>
      <Styled.PaginationItem item xs={4} sm={4}>
        <Styled.PaginationGroup>
          <Styled.PaginationText>{t('common.show')}</Styled.PaginationText>
          <MaterialSelect
            containerClasses="select"
            inputClasses={classes.inputSelect}
            value={limit}
            items={[
              { name: '10', value: 10 },
              { name: '20', value: 20 },
              { name: '30', value: 30 },
            ]}
            onSelected={onChangePageLimit}
            arrowStyle={arrowPagingStyles}
          />
        </Styled.PaginationGroup>
      </Styled.PaginationItem>
      <Styled.PaginationItem item xs={4} sm={4} $hideInMobile>
        {totalItem > limit && (
          <Styled.PaginationWrapper>
            <Pagination currentPage={selectedPage + 1} totalPages={totalPages} onPageSelected={handleSelectPage} />
          </Styled.PaginationWrapper>
        )}
      </Styled.PaginationItem>
      <Styled.PaginationItem item xs={8} sm={4}>
        <Styled.PaginationGroup $right>
          <Styled.PaginationText>{showEntry}</Styled.PaginationText>
        </Styled.PaginationGroup>
      </Styled.PaginationItem>
    </Styled.PaginationContainer>
  );
};

export default OrganizationListPagination;
