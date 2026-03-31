import { Button, TextInput } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';

import selectors from 'selectors';

import Select from 'lumin-components/GeneralLayout/general-components/Select';

import { useTranslation } from 'hooks';

import useInserAction from './useInsertAction';
import { SELECT_VALUE } from '../MergePanel/constants';

import * as Styled from './InsertPanel.styled';

import styles from './InsertPanel.module.scss';

export const InsertPanel = ({ totalPages }) => {
  const { t } = useTranslation();
  const [beforeOrAfter, setBeforeOrAfter] = useState(SELECT_VALUE.BEFORE);
  const [position, setPosition] = useState('');
  const [pageLocationError, setPageLocationError] = useState('');
  const [numberOfPages, setPages] = useState(1);
  const [pagesError, setPagesError] = useState('');
  const { handleInserBlankPage: handleInserMultipleBlankPages } = useInserAction({
    setPageLocationError,
    setPagesError,
  });
  const disabled = !position || !numberOfPages;

  const validateNumberOnly = (event) => event.key.length > 1 || /\d/.test(event.key);

  const onlyAllowNumberKeyChange = (event) => {
    if (validateNumberOnly(event)) {
      return;
    }
    event.preventDefault();
  };

  const onInputChange = (event) => {
    setPosition(event.target.value);
    setPageLocationError('');
  };

  const onPagesChange = (event) => {
    setPages(event.target.value);
    setPagesError('');
  };

  return (
    <Styled.Wrapper data-cy="insert_panel">
      <Styled.Title>{t('viewer.leftPanelEditMode.choosePositionToInsert')}</Styled.Title>

      <Styled.MainContent>
        <label className={styles.fieldLabel}>{t('viewer.leftPanelEditMode.location')}</label>
        <Select
          data-cy="insert_panel_select"
          canEditInput={false}
          value={beforeOrAfter}
          onChange={(e, { value }) => {
            setBeforeOrAfter(value);
          }}
          options={[
            {
              label: t('viewer.leftPanelEditMode.before'),
              value: SELECT_VALUE.BEFORE,
              itemProps: {
                'data-cy': 'insert_panel_select_item',
              },
            },
            {
              label: t('viewer.leftPanelEditMode.after'),
              value: SELECT_VALUE.AFTER,
              itemProps: {
                'data-cy': 'insert_panel_select_item',
              },
            },
          ]}
        />

        <Styled.InputWrapper data-cy="page_location_wrapper">
          <TextInput
            placeholder={t('message.EGPages', { pages: 1 })}
            onChange={onInputChange}
            onKeyDown={onlyAllowNumberKeyChange}
            error={pageLocationError}
            value={position}
            label={t('viewer.leftPanelEditMode.page')}
            wrapperProps={{
              'data-cy': 'insert_panel_input',
            }}
          />

          <Styled.TotalPage>
            {t('common.of')} {totalPages}
          </Styled.TotalPage>
        </Styled.InputWrapper>
      </Styled.MainContent>
      <Styled.Title>{t('common.numberOfPages')}</Styled.Title>
      <Styled.MainContent>
        <TextInput
          type="number"
          placeholder={t('message.EGPages', { pages: 1 })}
          label={t('viewer.leftPanelEditMode.page')}
          onChange={onPagesChange}
          onKeyDown={onlyAllowNumberKeyChange}
          value={numberOfPages}
          error={pagesError}
        />
      </Styled.MainContent>

      <Button
        disabled={disabled}
        size="lg"
        onClick={() => handleInserMultipleBlankPages({ position, beforeOrAfter, numberOfPages })}
      >
        {t('viewer.leftPanelEditMode.insert')}
      </Button>
    </Styled.Wrapper>
  );
};

InsertPanel.propTypes = {
  totalPages: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  totalPages: selectors.getTotalPages(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(InsertPanel);
