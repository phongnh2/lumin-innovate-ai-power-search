import React, { useCallback } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';

import PanelHeader from '@new-ui/components/LuminLeftPanel/components/PanelHeader';

import actions from 'actions';
import selectors from 'selectors';
import { RootState } from 'store';

import AppCircularLoading from 'luminComponents/AppCircularLoading';

import { useCleanup, useTranslation } from 'hooks';

import { OutlineBottom } from './OutlineBottom';
import { OutlineTree } from './OutlineTree';
import { useOutlineTreeContext } from '../contexts/Outline.context';

import * as Styled from './OutlinePanel.styled';

type TOutlinePanelProps = {
  isLoadingDocumentOutlines: boolean;
};

const OutlinePanel = ({ isLoadingDocumentOutlines }: TOutlinePanelProps) => {
  const { t } = useTranslation();
  const isOffline = useSelector(selectors.isOffline);
  const dispatch = useDispatch();
  const canModifyOutline = !isOffline;
  const { requestAccessModalElement } = useOutlineTreeContext();

  const closeOutlineModal = useCallback(() => {
    dispatch(actions.setOutlineEvent(null));
  }, []);

  useCleanup(closeOutlineModal);

  return (
    <>
      <Styled.OutlinePanel data-cy="outline_panel">
        {isLoadingDocumentOutlines ? (
          <Styled.LoadingContainer>
            <AppCircularLoading noTopGap />
          </Styled.LoadingContainer>
        ) : (
          <>
            <PanelHeader title={t('viewer.viewerLeftPanel.outlines')} />
            <OutlineTree canModifyOutline={canModifyOutline} />
            <OutlineBottom canModifyOutline={canModifyOutline} />
          </>
        )}
      </Styled.OutlinePanel>
      {requestAccessModalElement}
    </>
  );
};

OutlinePanel.propTypes = {};

const mapStateToProps = (state: RootState) => ({
  isLoadingDocumentOutlines: selectors.getIsLoadingDocumentOutlines(state),
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(OutlinePanel);
