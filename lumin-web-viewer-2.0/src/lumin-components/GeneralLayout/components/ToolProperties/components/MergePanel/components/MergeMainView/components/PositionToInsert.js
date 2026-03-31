/* eslint-disable import/no-cycle */
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import { onInputPositionKeyDown } from '@new-ui/components/ToolProperties/components/MergePanel/utils/utils';

import selectors from 'selectors';

import Select from 'lumin-components/GeneralLayout/general-components/Select';
import TextField from 'lumin-components/GeneralLayout/general-components/TextField';

import { useTranslation } from 'hooks';

import { SELECT_VALUE } from '../../../constants';
import { MergePanelContext } from '../../../MergePanel';
import { MergeMainViewContext } from '../MergeMainView';
import * as Styled from '../MergeMainView.styled';

export const PositionToInsert = ({ totalPages }) => {
  const { t } = useTranslation();
  const { insertBeforeOrAfter, setInsertBeforeOrAfter, pagePosition, pagePositionErrorMessage } =
    useContext(MergeMainViewContext);
  const { handleInputPositionChange } = useContext(MergePanelContext);
  return (
    <Styled.SelectPositionWrapper>
      <Styled.ChoosePositionDescWrapper>
        <Styled.Title>{t('viewer.leftPanelEditMode.choosePositionToInsert')}</Styled.Title>
      </Styled.ChoosePositionDescWrapper>

      <Styled.SelectPositionContent>
        <Styled.Label>{t('viewer.leftPanelEditMode.location')}</Styled.Label>

        <Select
          value={insertBeforeOrAfter}
          onChange={(e, { value }) => {
            setInsertBeforeOrAfter(value);
          }}
          options={[
            {
              label: t('viewer.mergePagePanel.afterCurrentDocument'),
              value: SELECT_VALUE.AFTER,
            },
            {
              label: t('viewer.mergePagePanel.beforeCurrentDocument'),
              value: SELECT_VALUE.BEFORE,
            },
            {
              label: t('viewer.mergePagePanel.afterSpecificPage'),
              value: SELECT_VALUE.SPECIFIC,
            },
          ]}
        />
        {insertBeforeOrAfter === SELECT_VALUE.SPECIFIC ? (
          <>
            <Styled.PageLabel>{t('viewer.leftPanelEditMode.page')}</Styled.PageLabel>
            <Styled.LocationWrapper>
              <TextField
                placeholder="1"
                onChange={handleInputPositionChange}
                onKeyDown={onInputPositionKeyDown}
                errorText={pagePositionErrorMessage}
                error={!!pagePositionErrorMessage}
                value={String(pagePosition)}
              />

              <Styled.TotalPage>{`${t('common.of')} ${totalPages}`} </Styled.TotalPage>
            </Styled.LocationWrapper>
          </>
        ) : null}
      </Styled.SelectPositionContent>
    </Styled.SelectPositionWrapper>
  );
};

PositionToInsert.propTypes = {
  totalPages: PropTypes.number.isRequired,
};

const mapStateToProps = (state) => ({
  totalPages: selectors.getTotalPages(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PositionToInsert);
