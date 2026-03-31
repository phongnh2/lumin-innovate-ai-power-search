import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import selectors from 'selectors';

import { AppLayoutContext } from 'layouts/AppLayout/AppLayoutContext';

import { DocumentContext } from 'lumin-components/Document/context';
import DocumentComponents from 'lumin-components/DocumentComponents';
import UploadDropZone, { UploadDropZoneContext } from 'lumin-components/UploadDropZone';
import BackToTop from 'luminComponents/BackToTop';
import DocumentListHeader from 'luminComponents/DocumentListHeader';
import DocumentListHeaderBar from 'luminComponents/DocumentListHeaderBar';

import { lazyWithRetry } from 'utils/lazyWithRetry';

import { layoutType, ownerFilter, modifiedFilter, MOBILE_BACK_TO_TOP_TRIGGER_AT } from 'constants/documentConstants';

import { DocumentListRendererContext } from './Context';
import DocumentListRenderer from './DocumentListRenderer';
import { withDocumentModal, withOpenDocDecorator, withCurrentDocuments, withOfflineDocumentList } from './HOC';

import * as Styled from './DocumentList.styled';

import styles from './DocumentList.module.scss';

const AgreementSection = lazyWithRetry(() => import('features/CNC/CncComponents/AgreementSection/AgreementSection'));
const AgreementSurvey = lazyWithRetry(() => import('features/CNC/CncComponents/AgreementSurvey'));

const propTypes = {
  documents: PropTypes.arrayOf(PropTypes.object),
  hasNextPage: PropTypes.bool,
  fetchMore: PropTypes.func.isRequired,
  folderLoading: PropTypes.bool,
  documentLoading: PropTypes.bool,
  ownedRule: PropTypes.string.isRequired,
  modifiedRule: PropTypes.string.isRequired,
  folder: PropTypes.object,
  openDocumentModal: PropTypes.func.isRequired,
  isOffline: PropTypes.bool,
  total: PropTypes.number,
  folders: PropTypes.array,
};

const defaultProps = {
  documents: [],
  hasNextPage: true,
  folderLoading: true,
  documentLoading: true,
  folder: null,
  isOffline: false,
  total: null,
  folders: [],
};

export class DocumentListClass extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isWindowDragging: false,
      selectDocMode: false,
    };
    this.count = 0;
    this.bodyScrollRef = React.createRef();
    this.contextValue = {
      bodyScrollRef: this.bodyScrollRef,
    };
  }

  componentDidMount() {
    window.addEventListener('dragover', this.onDragOver);
    window.addEventListener('drop', this.onDrop);
    window.addEventListener('dragenter', this.onEnter);
    window.addEventListener('dragleave', this.onLeave);
  }

  componentWillUnmount() {
    window.removeEventListener('dragover', this.onDragOver);
    window.removeEventListener('drop', this.onDrop);
    window.removeEventListener('dragenter', this.onEnter);
    window.removeEventListener('dragleave', this.onLeave);
  }

  onEnter = () => {
    this.count++;
  };

  onLeave = () => {
    this.count--;
    if (this.count === 0) {
      this.onDrop();
    }
  };

  onDragOver = () => {
    this.setState({
      isWindowDragging: true,
    });
  };

  onDrop = () => {
    this.setState({
      isWindowDragging: false,
    });
  };

  onChangeSelectMode = (selectMode) => this.setState({ selectDocMode: selectMode });

  render() {
    const { isWindowDragging, selectDocMode } = this.state;
    const {
      documents,
      documentLoading,
      folderLoading,
      ownedRule,
      modifiedRule,
      folder,
      hasNextPage,
      fetchMore,
      openDocumentModal,
      isOffline,
      total,
      folders,
    } = this.props;

    const {
      selectedDocList,
      setRemoveDocList,
      documentLayout,
      setDocumentLayout,
      selectedFolders,
      setRemoveFolderList,
      error: documentError,
    } = this.context;

    const isEmptyList =
      !folderLoading &&
      !documentLoading &&
      !documents.length &&
      !folders.length &&
      ownedRule === ownerFilter.byAnyone &&
      modifiedRule === modifiedFilter.modifiedByAnyone;

    const selectedMode = Boolean(selectedDocList.length) || Boolean(selectedFolders.length) || selectDocMode;
    const contextValue = {
      selectDocMode: selectedMode,
      setSelectDocMode: this.onChangeSelectMode,
      setRemoveDocList,
      setRemoveFolderList,
    };

    const renderDocumentListSection = (showHighlight) => (
      <Styled.UploadDropZoneHighlightReskin
        $isWindowDragging={isWindowDragging}
        $isMultipleSelecting={selectDocMode}
        $showHighlight={showHighlight}
        $isEmptyList={isEmptyList}
        className={styles.uploadDropZoneContainer}
      >
        {showHighlight && (
          <svg className={styles.dragAndDropSvg} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <rect
              width="100%"
              height="100%"
              fill="none"
              strokeDasharray="6"
              strokeDashoffset="0"
              strokeLinecap="square"
              className={styles.dragAndDropBorder}
            />
          </svg>
        )}
        <Styled.DocumentListWrapperReskin
          className={classNames('custom-scrollbar-reskin custom-scrollbar--overflow-y-auto', {
            [styles.scrollerContainer]: isEmptyList,
            [styles.notScrollerContainer]: !isEmptyList,
          })}
          ref={this.bodyScrollRef}
        >
          {!documentError && (
            <div className={styles.headerWrapperReskin} data-is-dragging={showHighlight}>
              <DocumentListHeaderBar
                documents={documents}
                selectedDocList={selectedDocList}
                selectedFolders={selectedFolders}
                selectDocMode={selectedMode}
                setSelectDocMode={this.onChangeSelectMode}
                setRemoveDocList={setRemoveDocList}
                openDocumentModal={openDocumentModal}
                total={total}
                setRemoveFolderList={setRemoveFolderList}
                folders={folders}
              />
              <DocumentListHeader
                type={documentLayout}
                isEmptyList={isEmptyList && !folders.length}
                selectedDocList={selectedDocList}
                selectDocMode={selectedMode}
                setRemoveDocList={setRemoveDocList}
                setRemoveFolderList={setRemoveFolderList}
                setSelectDocMode={this.onChangeSelectMode}
              />
              <Styled.DividerReskin $empty={isEmptyList} $isListLayout={documentLayout === layoutType.list} />
            </div>
          )}
          <DocumentListRendererContext.Provider value={contextValue}>
            <DocumentListRenderer
              documents={documents}
              folders={folders}
              folderLoading={folderLoading}
              documentLoading={documentLoading}
              hasNextPage={hasNextPage}
              fetchMore={fetchMore}
              openDocumentModal={openDocumentModal}
              total={total}
            />
          </DocumentListRendererContext.Provider>
        </Styled.DocumentListWrapperReskin>
        <AgreementSection />
        <AgreementSurvey />
      </Styled.UploadDropZoneHighlightReskin>
    );

    const renderContent = () => (
      <Styled.ContainerReskin $isMultipleSelecting={selectDocMode} id="document-list-root">
        <BackToTop stickAt={MOBILE_BACK_TO_TOP_TRIGGER_AT} />
        <Styled.HeaderReskin
          $isMultipleSelecting={selectDocMode}
          $isWindowDragging={isWindowDragging}
          $showHighlight={false}
        >
          <DocumentComponents.LayoutSwitcher layout={documentLayout} folder={folder} onChange={setDocumentLayout} />
        </Styled.HeaderReskin>
        <div className={styles.listContainer}>
          <UploadDropZone highlight={!selectDocMode && !isEmptyList} isOffline={isOffline}>
            <UploadDropZoneContext.Consumer>
              {({ showHighlight }) => renderDocumentListSection(showHighlight)}
            </UploadDropZoneContext.Consumer>
          </UploadDropZone>
        </div>
      </Styled.ContainerReskin>
    );

    return <AppLayoutContext.Provider value={this.contextValue}>{renderContent()}</AppLayoutContext.Provider>;
  }
}

DocumentListClass.propTypes = propTypes;
DocumentListClass.defaultProps = defaultProps;
DocumentListClass.contextType = DocumentContext;

const DocumentList = DocumentListClass;

const mapStateToProps = (state) => ({
  ownedRule: selectors.getCurrentOwnedFilter(state),
  modifiedRule: selectors.getCurrentLastModifiedFilter(state),
  isOffline: selectors.isOffline(state),
});

export default compose(
  connect(mapStateToProps),
  withDocumentModal,
  withCurrentDocuments,
  withOpenDocDecorator,
  withOfflineDocumentList,
  React.memo
)(DocumentList);
