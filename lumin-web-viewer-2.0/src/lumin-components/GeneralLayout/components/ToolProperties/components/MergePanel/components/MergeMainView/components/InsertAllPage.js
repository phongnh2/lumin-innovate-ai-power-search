/* eslint-disable import/no-cycle */
import React, { useContext } from 'react';
import { connect } from 'react-redux';

import {
  isAllPageAvailable,
  isThereAFileWithError,
  onInputPageInsertKeydown,
} from '@new-ui/components/ToolProperties/components/MergePanel/utils/utils';
import Checkbox from '@new-ui/general-components/Checkbox';
import FormControlLabel from '@new-ui/general-components/FormControlLabel';
import TextField from '@new-ui/general-components/TextField';

import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { MergePanelContext } from '../../../MergePanel';
import { MergeMainViewContext } from '../MergeMainView';
import * as Styled from '../MergeMainView.styled';

export const InsertAllPage = () => {
  const { toggleAllPage } = useContext(MergePanelContext);

  const { allPages, handleInputPageInsertChange, pagesInsert, filesInfo, pageInsertErrorMessage } =
    useContext(MergeMainViewContext);

  const { t } = useTranslation();

  const isFirstDocSinglePage = filesInfo[0]?.totalPages === 1;
  const _isThereAFileWithError = isThereAFileWithError(filesInfo);
  const disableCheckbox = filesInfo.length > 1 || isFirstDocSinglePage || _isThereAFileWithError;

  return (
    <Styled.InsertAllPagesWrapper>
      <Styled.CheckboxWrapper>
        <FormControlLabel
          checked={isAllPageAvailable(filesInfo, allPages)}
          disabled={disableCheckbox}
          control={
            <Checkbox
              id="all_page"
              type="checkbox"
              checked={isAllPageAvailable(filesInfo, allPages)}
              onChange={() => toggleAllPage(allPages)}
            />
          }
          label={t('action.insertAllPages')}
        />
      </Styled.CheckboxWrapper>

      {!isAllPageAvailable(filesInfo, allPages) && (
        <Styled.InsertAllWrapper>
          <Styled.BaseTitleWrapper>
            <Styled.Title>{t('viewer.leftPanelEditMode.whichPagesYouWantToInsert')}</Styled.Title>
          </Styled.BaseTitleWrapper>

          <Styled.BaseTitleWrapper>
            <Styled.ChoosePositionDesc>
              {t('viewer.leftPanelEditMode.enterACommaSeparatedListOfPagesToInsert')}
            </Styled.ChoosePositionDesc>
          </Styled.BaseTitleWrapper>

          <TextField
            placeholder={t('common.eg', { egText: '1 - 2, 5' })}
            style={{ width: '100%' }}
            value={pagesInsert}
            onKeyDown={onInputPageInsertKeydown}
            onChange={handleInputPageInsertChange}
            errorText={pageInsertErrorMessage}
            error={!!pageInsertErrorMessage}
          />
        </Styled.InsertAllWrapper>
      )}
    </Styled.InsertAllPagesWrapper>
  );
};

InsertAllPage.propTypes = {};

const mapStateToProps = (state) => ({
  totalPages: selectors.getTotalPages(state),
});

export default connect(mapStateToProps)(InsertAllPage);
