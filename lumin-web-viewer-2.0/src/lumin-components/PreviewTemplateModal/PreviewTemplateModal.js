/* eslint-disable no-use-before-define */
import React, {
  useCallback,
  useMemo,
  useState,
  useContext,
  useEffect,
} from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import rafSchd from 'raf-schd';
import { Trans } from 'react-i18next';

import selectors from 'selectors';
import actions from 'actions';

import Icomoon from 'lumin-components/Icomoon';
import Loading from 'lumin-components/Loading';
import { Colors } from 'constants/styles';
import { ModalTypes } from 'constants/lumin-common';
import { TEMPLATE_TABS } from 'constants/templateConstant';
import { MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION } from 'constants/organizationConstants';
import { WorkspaceTemplate } from 'constants/workspaceTemplate';
import { useCurrentTemplateList, useTabletMatch, useTranslation } from 'hooks';
import TemplateContext from 'screens/Templates/context';
import getNumberOfPagesToNavigate from 'helpers/getNumberOfPagesToNavigate';
import core from 'core';
import { ButtonName } from 'utils/Factory/EventCollection/constants/ButtonEvent';
import templateEvent from 'utils/Factory/EventCollection/TemplateEventCollection';

import useCreateDocument from './hooks/useCreateDocument';
import useLoadPdfCore from './hooks/useLoadPdfCore';
import useGetTemplate from './hooks/useGetTemplate';
import Pagination from './components/Pagination';
import PreviewTemplateSkeleton from './components/PreviewTemplateSkeleton';
import * as Styled from './PreviewTemplateModal.styled';

const PreviewTemplateModal = ({
  onClose,
  templateId,
  openModal,
  currentOrganization,
  updateTemplate,
}) => {
  const { t } = useTranslation();
  const { getTemplates } = useContext(TemplateContext);
  const isTabletUp = useTabletMatch();
  const [scrollViewElement, setScrollViewElement] = useState(null);
  const [documentElement, setDocumentElement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const [templateType] = useCurrentTemplateList();
  const [descriptionRef, setDescriptionRef] = useState(null);
  const { loading: templateFetching, template: currentTemplate } = useGetTemplate(templateId, {
    increaseView: true,
    onFetchSuccess: updateTemplate,
    getTemplates,
    onClose,
  });
  const { loading } = useLoadPdfCore({
    scrollViewElement,
    documentElement,
    loadResource: currentTemplate?.loadResource,
  });
  const [onCreateDocument] = useCreateDocument({
    setDownloading, templateType,
  });

  const onIntersection = ([{ isIntersecting }]) => isIntersecting && templateEvent.previewScrollToBottom({
    fileId: templateId,
    location: templateType,
  });

  useEffect(() => {
    templateEvent.previewTemplate({
      fileId: templateId,
      location: templateType,
    });
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(onIntersection, { threshold: 1 });
    if (descriptionRef) {
      io.observe(descriptionRef);
    }
    return () => {
      io.disconnect();
    };
  }, [descriptionRef]);

  const getButtonCloseSize = () => (isTabletUp ? 44 : 40);

  const onClickUseTemplate = (e) => {
    switch (templateType) {
      case TEMPLATE_TABS.PERSONAL:
      case TEMPLATE_TABS.TEAM: {
        onCreateDocument({ templateId });
        break;
      }
      case TEMPLATE_TABS.ORGANIZATION: {
        const { settings: { templateWorkspace }, name: organizationName, totalActiveMember } = currentOrganization.data;
        if (templateWorkspace === WorkspaceTemplate.PERSONAL) {
          onCreateDocument({ templateId });
        } else {
          const isOverSizeLimitForNoti = totalActiveMember > MAXIMUM_ORG_TOTAL_MEMBER_PUSH_NOTIFICATION;
          const modalSettings = {
            type: ModalTypes.WARNING,
            title: t('common.notify'),
            message: (
              <Trans
                i18nKey="messageUseTemplate"
                who={isOverSizeLimitForNoti ? 'admins' : 'everyone'}
                organizationName={organizationName}
              >
                Your admin requests this template to be used within this circle.<br />
                Do you want to notify {{ who: isOverSizeLimitForNoti ? 'admins' : 'everyone' }} in
                <b>{{ organizationName }} Circle</b> about your upload? This file will be saved at Lumin Storage.
              </Trans>
            ),
            cancelButtonTitle: t('common.no'),
            confirmButtonTitle: t('common.yes'),
            onCancel: () => onCreateDocument({ templateId }),
            onConfirm: () => {
              onCreateDocument({ templateId, notify: true });
            },
            checkboxMessage: t('common.doNotShowAgain'),
            disableBackdropClick: true,
            disableEscapeKeyDown: true,
          };
          openModal(modalSettings);
        }
        break;
      }
      default:
        break;
    }
    e.stopPropagation();
  };

  const onContainerScroll = useCallback(rafSchd(() => {
    if (core.isContinuousDisplayMode()) {
      const page = core.getCurrentPage();
      setCurrentPage(page);
    }
  }), []);

  const onContainerWheel = (e) => {
    if (!core.isContinuousDisplayMode() && scrollViewElement) {
      wheelToNavigatePages(e);
    }
  };

  const wheelToNavigatePages = (e) => {
    const totalPages = core.getTotalPages();
    const { scrollTop, scrollHeight, clientHeight } = scrollViewElement;
    const reachedTop = scrollTop === 0;
    const reachedBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 1;

    // depending on the track pad used (see this on MacBooks), deltaY can be between -1 and 1 when doing horizontal scrolling which cause page to change
    const scrollingUp = e.deltaY < 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX);
    const scrollingDown = e.deltaY > 0 && Math.abs(e.deltaY) > Math.abs(e.deltaX);

    if (scrollingUp && reachedTop && currentPage > 1) {
      pageUp();
    } else if (scrollingDown && reachedBottom && currentPage < totalPages) {
      pageDown();
    }
  };

  const pageUp = () => {
    const { scrollHeight, clientHeight } = scrollViewElement;
    const newPage = currentPage - getNumberOfPagesToNavigate();
    core.setCurrentPage(newPage);
    setCurrentPage(newPage);
    scrollViewElement.scrollTop = scrollHeight - clientHeight;
  };

  const pageDown = () => {
    const newPage = currentPage + getNumberOfPagesToNavigate();
    core.setCurrentPage(newPage);
    setCurrentPage(newPage);
  };

  const previewWrapper = useMemo(() => (
    <Styled.PreviewWrapper>
      {(loading || templateFetching) && <Loading normal size={32} />}
      <Styled.ThumbContainer ref={setDocumentElement} />
    </Styled.PreviewWrapper>
  ), [loading, templateFetching]);

  if (templateFetching) {
    return <PreviewTemplateSkeleton />;
  }

  return (
    <Styled.CssVariableProvider>
      <Styled.Header>
        <Styled.Title>
          {currentTemplate.name}
        </Styled.Title>
        <Styled.ButtonClose
          onClick={onClose}
          icon="cancel"
          iconSize={14}
          iconColor={Colors.NEUTRAL_80}
          size={getButtonCloseSize()}
        />
      </Styled.Header>
      <div style={{ position: 'relative' }}>
        <Styled.PreviewContainer className="custom-scrollbar" ref={setScrollViewElement} onScroll={onContainerScroll} onWheel={onContainerWheel}>
          {previewWrapper}
        </Styled.PreviewContainer>
        {!loading && <Pagination currentPage={currentPage} totalPage={core.getTotalPages()} />}
      </div>
      <Styled.InfoContainer>
        <Styled.InfoLeftGroup>
          <Icomoon className="eye-open" color={Colors.NEUTRAL_60} size={20} />
          <Styled.ViewCount>{currentTemplate.counter?.view || 0}</Styled.ViewCount>
          <Icomoon className="download-3" color={Colors.NEUTRAL_60} size={18} />
          <Styled.DownloadCount>{currentTemplate.counter?.download || 0}</Styled.DownloadCount>
        </Styled.InfoLeftGroup>
        <div>
          <Styled.ButtonUseTemplate
            onClick={onClickUseTemplate}
            loading={downloading}
            data-lumin-btn-name={ButtonName.USE_TEMPLATE}
          >
            {t('templatePage.useTemplate')}
          </Styled.ButtonUseTemplate>
        </div>
      </Styled.InfoContainer>
      <Styled.HDivider />
      <Styled.DescContainer ref={(node) => setDescriptionRef(node)}>
        <Styled.DescTitle>{t('common.description')}</Styled.DescTitle>
        <Styled.Desc>
          {currentTemplate.description}
        </Styled.Desc>
      </Styled.DescContainer>
    </Styled.CssVariableProvider>
  );
};

PreviewTemplateModal.propTypes = {
  onClose: PropTypes.func,
  templateId: PropTypes.string.isRequired,
  openModal: PropTypes.func,
  currentOrganization: PropTypes.object,
  updateTemplate: PropTypes.func,
};

PreviewTemplateModal.defaultProps = {
  onClose: () => {},
  openModal: () => {},
  currentOrganization: {},
  updateTemplate: () => {},
};

const mapStateToProps = (state) => ({
  currentOrganization: selectors.getCurrentOrganization(state),
});

const mapDispatchToProps = (dispatch) => ({
  openModal: (modalSettings) => dispatch(actions.openModal(modalSettings)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(PreviewTemplateModal);
