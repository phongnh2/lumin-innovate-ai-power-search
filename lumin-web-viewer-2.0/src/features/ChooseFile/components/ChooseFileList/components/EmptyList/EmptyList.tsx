import { Button, Icomoon } from 'lumin-ui/kiwi-ui';
import React, { useCallback, useContext } from 'react';

import EmptyDocumentListImage from 'assets/reskin/images/empty-document-list.png';

import { useTranslation } from 'hooks';

import { ChooseFileContext } from 'features/ChooseFile/contexts/ChooseFile.context';
import { ActionTypes } from 'features/ChooseFile/reducers/ChooseFile.reducer';

import styles from './EmptyList.module.scss';

const EmptyList = () => {
  const { t } = useTranslation();

  const { state, dispatch } = useContext(ChooseFileContext);

  const onGoBack = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_BREADCRUMB_DATA,
      payload: {
        breadcrumbData: state.breadcrumbData.slice(0, -1),
      },
    });
  }, [dispatch, state]);

  return (
    <div className={styles.container}>
      <div className={styles.emptyImage}>
        <img src={EmptyDocumentListImage} alt="empty document list" />
      </div>
      <p className={styles.title}>{t('chooseFile.emptyDocuments.title')}</p>
      <span className={styles.description}>{t('chooseFile.emptyDocuments.description')}</span>
      <Button
        size="lg"
        variant="text"
        startIcon={<Icomoon type="arrow-narrow-left-lg" size="lg" />}
        data-cy="choose_a_file_to_edit_go_back_btn"
        onClick={onGoBack}
      >
        {t('chooseFile.emptyDocuments.goBack')}
      </Button>
    </div>
  );
};

export default EmptyList;
