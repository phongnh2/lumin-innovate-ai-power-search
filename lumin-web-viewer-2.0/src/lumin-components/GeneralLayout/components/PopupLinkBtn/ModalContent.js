import { Button, Tabs, TextInput } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import core from 'core';
import selectors from 'selectors';

import { useTranslation } from 'hooks';

import { DataElements } from 'constants/dataElement';
import defaultTool from 'constants/defaultTool';
import { PDF_ACTION_TYPE, URL_MAX_LENGTH } from 'constants/documentConstants';

import * as Styled from './PopupLinkBtn.styled';

const TAB_VALUES = {
  LINK: 'LINK',
  PAGE: 'PAGE',
};

const ModalContent = ({ pageLabels, closeModal, currentPage }) => {
  const [tabValue, setTabValue] = useState(TAB_VALUES.LINK);

  const urlInput = React.createRef();
  const pageLabelInput = React.createRef();
  const [url, setUrl] = useState('');
  const [pageLabel, setPageLabel] = useState('');

  const { t } = useTranslation();

  useEffect(() => {
    if (tabValue === TAB_VALUES.LINK) {
      urlInput.current.focus();
    } else {
      pageLabelInput.current.focus();
    }
  }, [tabValue]);

  const onUrlInputChange = (event) => {
    const { target } = event;
    if (target) {
      setUrl(target.value);
    }
  };

  const onPageInputChange = (event) => {
    const { target } = event;
    if (target) {
      setPageLabel(target.value);
    }
  };

  const onTabsChange = (value) => {
    setTabValue(value);
  };

  const onClose = () => {
    closeModal();
    setUrl('');
    setPageLabel('');
    core.setToolMode(defaultTool);
  };

  const createNewHighlightAnnotation = async (linkAnnotationArray, quads, text, action) => {
    const annotationManager = core.getAnnotationManager();
    const linkAnnotation = linkAnnotationArray[0];
    const highlight = new window.Core.Annotations.TextHighlightAnnotation();
    highlight.PageNumber = linkAnnotation.PageNumber;
    highlight.X = linkAnnotation.X;
    highlight.Y = linkAnnotation.Y;
    highlight.Width = linkAnnotation.Width;
    highlight.Height = linkAnnotation.Height;
    highlight.StrokeColor = new window.Core.Annotations.Color(70, 44, 164, 1);
    highlight.Opacity = 0;
    highlight.Quads = quads;
    highlight.Author = core.getCurrentUser();
    highlight.setContents(text);

    linkAnnotationArray.forEach((link, index) => {
      link.addAction(PDF_ACTION_TYPE.MOUSE_RELEASED, action);
      index === 0 ? core.addAnnotations([link, highlight]) : core.addAnnotations([link]);
    });
    annotationManager.groupAnnotations(highlight, linkAnnotationArray);
  };

  const createNewLinkAnnotation = ({ X, Y, Width, Height, PageNumber = currentPage, NoMove = true }) => {
    const properties = {
      X,
      Y,
      Width,
      Height,
      PageNumber,
      NoMove,
    };
    const hyperLinkAnnotation = new window.Core.Annotations.Link();
    hyperLinkAnnotation.StrokeColor = new window.Core.Annotations.Color(70, 143, 164, 1);
    hyperLinkAnnotation.StrokeStyle = 'underline';
    hyperLinkAnnotation.StrokeThickness = 1.5;
    hyperLinkAnnotation.Subject = 'Link';

    hyperLinkAnnotation.Author = core.getCurrentUser();
    hyperLinkAnnotation.Listable = true;
    hyperLinkAnnotation.NoResize = true;
    Object.assign(hyperLinkAnnotation, properties);

    return hyperLinkAnnotation;
  };

  const createLink = (action) => {
    const linkAnnotations = [];

    const selectedTextQuads = core.getSelectedTextQuads();
    const selectedAnnotations = core.getSelectedAnnotations();

    if (selectedTextQuads) {
      const selectedText = core.getSelectedText();
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const currPageNumber in selectedTextQuads) {
        const currPageLinks = [];
        selectedTextQuads[currPageNumber].forEach((quad) => {
          currPageLinks.push(
            createNewLinkAnnotation({
              X: Math.min(quad.x1, quad.x3),
              Y: Math.min(quad.y1, quad.y3),
              Width: Math.abs(quad.x1 - quad.x3),
              Height: Math.abs(quad.y1 - quad.y3),
              PageNumber: Number(currPageNumber),
            })
          );
        });
        createNewHighlightAnnotation(currPageLinks, selectedTextQuads[currPageNumber], selectedText, action);
        linkAnnotations.push(...currPageLinks);
      }
    }

    if (selectedAnnotations) {
      selectedAnnotations.forEach((annot) => {
        const annotationManager = core.getAnnotationManager();
        const groupedAnnotations = annotationManager.getGroupAnnotations(annot);
        const { PageNumber } = annot;

        // ungroup and delete any previously created links
        if (groupedAnnotations.length > 1) {
          const linksToDelete = groupedAnnotations.filter(
            (annotation) => annotation instanceof window.Core.Annotations.Link
          );
          if (linksToDelete.length > 0) {
            annotationManager.ungroupAnnotations(groupedAnnotations);
            core.deleteAnnotations(linksToDelete);
          }
        }

        const link = createNewLinkAnnotation({
          X: annot.X,
          Y: annot.Y,
          Height: annot.Height,
          Width: annot.Width,
          NoMove: annot.NoMove,
          PageNumber: Number(PageNumber),
        });
        link.addAction(PDF_ACTION_TYPE.MOUSE_RELEASED, action);
        core.addAnnotations([link]);
        annotationManager.groupAnnotations(annot, [link]);

        linkAnnotations.push(link);
      });
    }

    return linkAnnotations;
  };

  const addLinkAnchor = (e) => {
    e.preventDefault();

    const action = new window.Core.Actions.URI({ uri: url });
    const links = createLink(action);

    let pageNumbersToDraw = links.map((link) => link.PageNumber);
    pageNumbersToDraw = [...new Set(pageNumbersToDraw)];
    pageNumbersToDraw.forEach((pageNumberToDraw) => {
      core.drawAnnotations({ pageNumber: pageNumberToDraw, majorRedraw: true });
    });

    onClose();
  };

  const shouldDisabled = () => (tabValue === TAB_VALUES.LINK ? !url : !pageLabels?.includes(pageLabel));

  const addPageAnchor = (e) => {
    e.preventDefault();

    const { Dest } = window.Core.Actions.GoTo;

    const options = {
      dest: new Dest({ page: pageLabels.indexOf(pageLabel) + 1 }),
    };
    const action = new window.Core.Actions.GoTo(options);

    const links = createLink(action);

    let pageNumbersToDraw = links.map((link) => link.PageNumber);
    pageNumbersToDraw = [...new Set(pageNumbersToDraw)];
    pageNumbersToDraw.forEach((pageNumberToDraw) => {
      core.drawAnnotations({ pageNumber: pageNumberToDraw, majorRedraw: true });
    });

    onClose();
  };

  const renderInput = (value) => {
    if (value === TAB_VALUES.LINK) {
      return (
        <Styled.InputWrapper>
          <Styled.Label>{t('link.enterurl')}</Styled.Label>

          <TextInput
            ref={urlInput}
            onChange={onUrlInputChange}
            value={url}
            placeholder={t('viewer.linkModal.addYourURLHere')}
            maxLength={URL_MAX_LENGTH}
          />
        </Styled.InputWrapper>
      );
    }
    return (
      <Styled.InputWrapper>
        <Styled.Label>{t('link.enterpage')}</Styled.Label>
        <TextInput
          ref={pageLabelInput}
          onChange={onPageInputChange}
          value={pageLabel}
          type="number"
          placeholder={t('viewer.linkModal.addYourPageNumberHere')}
        />
      </Styled.InputWrapper>
    );
  };

  const getConfirmBtnClickFn = (value) => {
    if (value === TAB_VALUES.LINK) {
      return addLinkAnchor;
    }

    return addPageAnchor;
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Styled.TabsWrapper>
        <Tabs value={tabValue} onChange={onTabsChange}>
          <Tabs.List grow>
            <Tabs.Tab variant="tertiary" value={TAB_VALUES.LINK}>
              {t('viewer.linkModal.url')}
            </Tabs.Tab>
            <Tabs.Tab variant="tertiary" value={TAB_VALUES.PAGE}>
              {t('viewer.linkModal.page')}
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Styled.TabsWrapper>

      {renderInput(tabValue)}

      <Styled.BtnsWrapper>
        <Button size="lg" variant="outlined" onClick={closeModal}>
          {t('common.cancel')}
        </Button>

        <Button size="lg" onClick={getConfirmBtnClickFn(tabValue)} variant="filled" disabled={shouldDisabled()}>
          {t(tabValue === TAB_VALUES.LINK ? 'viewer.linkModal.linkURL' : 'viewer.linkModal.linkPage')}
        </Button>
      </Styled.BtnsWrapper>
    </div>
  );
};

const mapStateToProps = (state) => ({
  currentPage: selectors.getCurrentPage(state),
  tabSelected: selectors.getSelectedTab(state, DataElements.LINK_MODAL),
  pageLabels: selectors.getPageLabels(state),
});

const mapDispatchToProps = () => ({});

ModalContent.propTypes = {
  currentPage: PropTypes.number.isRequired,
  pageLabels: PropTypes.array.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalContent);
