import classNames from 'classnames';
import get from 'lodash/get';
import { Button } from 'lumin-ui/kiwi-ui';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';
import Measure from 'react-measure';
import { connect } from 'react-redux';
import { compose } from 'redux';

import IconButton from '@new-ui/general-components/IconButton';
import Tabs, { TabsList, Tab } from '@new-ui/general-components/Tabs';
import toastUtils from '@new-ui/utils/toastUtils';

import actions from 'actions';
import core from 'core';
import selectors from 'selectors';

import getAnnotationCenterPoint from 'helpers/getAnnotationCenterPoint';

import { signature } from 'utils';

import { withAddSignature } from 'features/Signature';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import defaultTool from 'constants/defaultTool';
import { images } from 'constants/documentType';
import { MAX_IMAGE_SIZE_IN_BYTES } from 'constants/fileSize';
import { ModalTypes, MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';
import { getErrorMessageMaxFieldLength } from 'constants/messages';
import { DEFAULT_SIGNATURE_MAXIMUM_DIMENSION } from 'constants/signatureConstant';

import ColorPicker from './ColorPicker';
import {
  MAX_INPUT_FIELD_LENGTH,
  FONT_SIZE,
  CONVERT_TO_CANVAS_LINE_WIDTH,
  DEFAULT_FILL_STYLE,
  CUSTOM_SIGNATURE_FONTS,
} from './constants';
import { CreateSignatureModalContentContext } from './CreateSignatureModalContentContext';
import DrawSection from './DrawSection';
import FontPicker from './FontPicker';
import Footer from './Footer';
import PlaceMultipleTime from './PlaceMultipleTime';
import TypingSection from './TypingSection';
import UploadImgSection from './UploadImgSection';
import { convertPtToFontWeight } from './utils';
import styles from '../CreateSignatureModalContent.module.scss';
import * as CreateSignatureModalContentStyled from '../CreateSignatureModalContent.styled';

import * as Styled from './MainContent.styled';

export const SIGNATURE_TYPE = {
  DRAW: 0,
  IMAGE: 1,
  TYPING: 2,
};

export const maxImageSize = (sizeLimit) => sizeLimit / (1024 * 1024);

const propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  activeToolStyles: PropTypes.object,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  setIsSavingSignature: PropTypes.func.isRequired,
  setSelectedSignature: PropTypes.func.isRequired,
  setSignatureWidgetSelected: PropTypes.func,
  t: PropTypes.func,
  addSignatureMutation: PropTypes.object.isRequired,
};
const defaultProps = {
  isDisabled: false,
  isOpen: false,
  activeToolStyles: {},
  currentUser: {},
  currentDocument: {},
  setSignatureWidgetSelected: () => {},
  t: () => {},
};
class MainContent extends React.PureComponent {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.imageSignatureRef = React.createRef();
    this.imgInputRef = React.createRef();
    this.initialState = {
      canClear: false,
      openStyle: false,
      selectedSignatureType: SIGNATURE_TYPE.DRAW,
      imageSignature: false,
      signatureFont: CUSTOM_SIGNATURE_FONTS[0].value,
      textSignature: '',
      dimension: {},
      openChangeFont: false,
      isDisabledButton: true,
      errorTextSignature: '',
      isStartDrawSignature: false,
    };
    this.state = this.initialState;
    this.signatureTool = core.getTool('AnnotationCreateSignature');
    this.signatureAdded = false;
  }

  componentDidMount() {
    const { closeElements } = this.props;
    closeElements(['printModal', 'errorModal', 'loadingModal', 'progressModal']);
    core.setToolMode('AnnotationCreateSignature');
    this.setUpSignatureCanvas();
    this.signatureTool.addEventListener('signatureSaved', this.handleSignatureSaved);
  }

  async componentDidUpdate(prevProps, prevState) {
    const { dimension, openStyle, textSignature, imageSignature, selectedSignatureType, errorTextSignature } =
      this.state;
    const { dimension: prevDimension } = prevState;
    const { isDisabled, isOpen, activeToolStyles, currentDocument, currentUser } = this.props;
    if (prevDimension !== dimension && dimension.height && dimension.width) {
      this.signatureTool.resizeCanvas();
    }

    if (prevProps.isDisabled && !isDisabled && !this.isCanvasReady) {
      this.setUpSignatureCanvas();
    }

    if (openStyle && prevProps.activeToolStyles !== activeToolStyles) {
      const annot = this.signatureTool.getFullSignatureAnnotation();
      if (!annot) {
        return;
      }
      const {
        StrokeColor: newStrokeColor,
        StrokeThickness: newStrokeThickness,
        Opacity: newOpacity,
      } = activeToolStyles;
      annot.StrokeColor = newStrokeColor;
      annot.StrokeThickness = newStrokeThickness;
      annot.Opacity = newOpacity;
      if (!(await this.signatureTool.isEmptySignature())) {
        const ctx = this.canvas.current.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = newStrokeColor.toHexString();
        ctx.lineWidth = newStrokeThickness * CONVERT_TO_CANVAS_LINE_WIDTH;
        ctx.globalAlpha = newOpacity;
        ctx.stroke();
      }
    }

    const { premiumToolsInfo } = currentDocument;
    const maximumNumberSignature = get(premiumToolsInfo, 'maximumNumberSignature', MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN);
    const numberSignature = signature.getNumberOfSignatures(currentUser);

    if (isOpen && numberSignature < maximumNumberSignature) {
      switch (selectedSignatureType) {
        case SIGNATURE_TYPE.IMAGE:
          if (imageSignature) {
            this.setState({ isDisabledButton: false });
          }
          break;
        case SIGNATURE_TYPE.TYPING:
          if (textSignature && !errorTextSignature) {
            this.setState({ isDisabledButton: false });
          } else {
            this.setState({ isDisabledButton: true });
          }
          break;
        case SIGNATURE_TYPE.DRAW:
          if (!(await this.signatureTool.isEmptySignature())) {
            this.setState({ isDisabledButton: false });
          }
          break;
        default:
          break;
      }
    }
  }

  componentWillUnmount() {
    this.signatureTool.removeEventListener('signatureSaved', this.handleSignatureSaved);
  }

  handleSignatureSaved = (annotations) => {
    annotations.forEach((annot) => {
      this.handleSignatureAdded(annot);
    });
  };

  saveSignature = async (signatureAnnotation) => {
    const { setIsSavingSignature } = this.props;
    this.signatureAdded = false;
    await signatureAnnotation.resourcesLoaded();
    setIsSavingSignature(false);
  };

  handleCreateSignature = async (signatureAnnotation) => {
    const { addSignatureMutation } = this.props;
    this.saveSignature(signatureAnnotation);
    const imageData = await signatureAnnotation.getImageData();
    await addSignatureMutation.trigger({
      base64: imageData,
      id: signatureAnnotation.Id,
      status: 'adding',
    });
  };

  handleSignatureAdded = async (anno) => {
    const { setIsSavingSignature } = this.props;
    if (anno.ToolName === 'AnnotationCreateSignature' && this.signatureAdded) {
      setIsSavingSignature(true);
      this.handleCreateSignature(anno);
      setIsSavingSignature(false);
    }
  };

  setUpSignatureCanvas = () => {
    if (!this.canvas.current) {
      return;
    }

    const canvas = this.canvas.current;
    this.signatureTool.setSignatureCanvas(canvas);

    const multiplier = window.Core.getCanvasMultiplier();
    canvas.getContext('2d').scale(multiplier, multiplier);
    this.isCanvasReady = true;
  };

  handleFinishDrawing = async (e) => {
    if (e.target === e.currentTarget && !(await this.signatureTool.isEmptySignature())) {
      /* rerender Save button after drawing signature completely */
      this.forceUpdate();
    }
  };

  handleStartDrawing = () => {
    this.setState({ isStartDrawSignature: true });
  };

  closeModal = () => {
    const { setSignatureWidgetSelected, closeElement } = this.props;
    this.signatureTool.clearLocation();
    this.clearCanvas();
    setSignatureWidgetSelected(null);
    closeElement('signatureModal');
    core.setToolMode(defaultTool);
  };

  clearCanvas = () => {
    this.signatureTool.clearSignatureCanvas();
    this.setState(this.initialState);
  };

  clearSignature = () => {
    const { selectedSignatureType } = this.state;
    switch (selectedSignatureType) {
      case SIGNATURE_TYPE.TYPING:
        this.setState({ textSignature: '', errorTextSignature: '' });
        break;

      case SIGNATURE_TYPE.IMAGE:
        this.setState({ imageSignature: false });
        break;

      case SIGNATURE_TYPE.DRAW:
        this.signatureTool.clearSignatureCanvas();
        // force to re-render even when the initialState is not changed.
        // to handle the status of the Save button.
        this.setState(this.initialState, () => this.forceUpdate());
        break;

      default:
        break;
    }
  };

  selectCreatedSignature = async (newSignature) => {
    const { setSelectedSignature } = this.props;
    setSelectedSignature(newSignature);
    await this.signatureTool.setSignature(newSignature);
  };

  createSignature = async () => {
    const { activeToolStyles, closeElement } = this.props;
    const { textSignature, signatureFont, selectedSignatureType } = this.state;

    switch (selectedSignatureType) {
      case SIGNATURE_TYPE.DRAW:
        if (!(await this.signatureTool.isEmptySignature())) {
          const newSignature = this.canvas.current.toDataURL();
          await this.selectCreatedSignature(newSignature);
        }
        break;

      case SIGNATURE_TYPE.TYPING: {
        if (textSignature === '') {
          return;
        }
        this.clearCanvas();
        this.signatureTool.clearLocation();

        const multiplier = window.Core.getCanvasMultiplier();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${FONT_SIZE * multiplier}px ${signatureFont}`;
        // Concat with 'aa' to add some padding to the text to make sure the text is not cut off
        const textMetric = ctx.measureText(textSignature.concat('aa'));
        // Ref: https://developer.mozilla.org/en-US/docs/Web/API/TextMetrics#measuring_text_width
        const lengthSignature = parseInt(textMetric.actualBoundingBoxRight + textMetric.actualBoundingBoxLeft);
        const canvasW = this.canvas.current.width;
        const canvasH = this.canvas.current.height;

        if (lengthSignature > canvasW * multiplier) {
          const aspectRatio = canvasW / canvasH;
          canvas.width = lengthSignature;
          canvas.height = canvas.width / aspectRatio;
        } else {
          canvas.height = canvasH * multiplier;
          canvas.width = canvasW * multiplier;
        }

        const { StrokeThickness, StrokeColor, Opacity } = activeToolStyles;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = StrokeColor
          ? `rgba(${StrokeColor.R},${StrokeColor.G},${StrokeColor.B},${Opacity})`
          : DEFAULT_FILL_STYLE;
        ctx.font = `${convertPtToFontWeight(StrokeThickness)} ${FONT_SIZE * multiplier}px ${signatureFont}`;
        ctx.fillText(textSignature, canvas.width / 2, canvas.height / 2);
        const newSignature = canvas.toDataURL();
        await this.selectCreatedSignature(newSignature);
        break;
      }

      case SIGNATURE_TYPE.IMAGE: {
        this.clearCanvas();
        this.signatureTool.clearLocation();
        const src = this.imageSignatureRef.current?.src;

        const prefixData = src.split(';')[2];
        const base64Data = src.split(';')[3];

        const imgSrc = `${prefixData};${base64Data}`;
        await this.selectCreatedSignature(imgSrc);
        break;
      }

      default:
        break;
    }
    this.signatureAdded = true;
    this.handleSignatureAdded(this.signatureTool.getFullSignatureAnnotation());
    if (this.signatureTool.widget) {
      const associatedSignature = this.signatureTool.getFullSignatureAnnotation();
      associatedSignature.setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, this.signatureTool.widget.Id);
      associatedSignature.setCustomData(
        CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.alternativeKey,
        this.signatureTool.widget.fieldName
      );
      associatedSignature.setCustomData(
        CUSTOM_DATA_WIDGET_ANNOTATION.FIELD_NAME.key,
        this.signatureTool.widget.fieldName
      );

      this.signatureTool.setDefaultSignatureOptions({
        maximumDimensionSize: Math.min(
          Math.min(this.signatureTool.widget.Width, this.signatureTool.widget.Height),
          DEFAULT_SIGNATURE_MAXIMUM_DIMENSION
        ),
      });

      this.signatureTool.location = getAnnotationCenterPoint(this.signatureTool.widget);
    }
    if (this.signatureTool.hasLocation()) {
      await this.signatureTool.addSignature();
      this.signatureTool.setDefaultSignatureOptions({
        maximumDimensionSize: DEFAULT_SIGNATURE_MAXIMUM_DIMENSION,
      });
    } else {
      this.signatureTool.showPreview();
    }
    closeElement('signatureModal');
  };

  changeSignatureType = (type) => {
    this.setState({ ...this.initialState, selectedSignatureType: type });
  };

  handleUploadFile = (e, file) => {
    const { t } = this.props;
    if (![images.JPEG, images.PNG, images.JPG].includes(file.type)) {
      const toastSetting = {
        type: ModalTypes.ERROR,
        message: t('viewer.signatureModal.pleaseUploadAnImage'),
      };
      toastUtils.error(toastSetting);
    } else if (file.size > MAX_IMAGE_SIZE_IN_BYTES) {
      const toastSetting = {
        type: ModalTypes.ERROR,
        message: t('viewer.signatureModal.sizeLimitDescription', {
          size: maxImageSize(MAX_IMAGE_SIZE_IN_BYTES),
        }),
      };
      toastUtils.error(toastSetting);
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.setState({ imageSignature: true });
        this.imageSignatureRef.current.src = `data:${file.type};charset=utf-8;${reader.result}`;
      };
    }
    if (e) {
      e.target.value = null;
    }
  };

  setTextSignature = (e) => {
    const { value } = e.target;
    this.setState({ textSignature: value });
    if (value.trim().length > MAX_INPUT_FIELD_LENGTH) {
      this.setState({ errorTextSignature: getErrorMessageMaxFieldLength(MAX_INPUT_FIELD_LENGTH) });
    } else {
      this.setState({ errorTextSignature: '' });
    }
  };

  changeFont = (font) => {
    this.setState({
      signatureFont: font,
    });
  };

  setOpenStyle = (openStyle) => {
    this.setState({
      openStyle,
    });
  };

  setOpenChangeFont = (isOpenChangeFont) => {
    this.setState({
      openChangeFont: isOpenChangeFont,
    });
  };

  handleClickMainContent = (e) => {
    const { openStyle, openChangeFont } = this.state;
    if (openStyle || openChangeFont) {
      return;
    }

    e.stopPropagation();
  };

  renderActionBoard = () => {
    const { selectedSignatureType } = this.state;
    switch (selectedSignatureType) {
      case SIGNATURE_TYPE.DRAW:
        return <DrawSection />;

      case SIGNATURE_TYPE.TYPING:
        return <TypingSection />;

      case SIGNATURE_TYPE.IMAGE:
        return <UploadImgSection />;

      default:
        return <div />;
    }
  };

  renderChangeImageBtn = (imageSignature) => {
    const { t } = this.props;
    return imageSignature ? (
      <Styled.RemoveBtnWrapper>
        <Button onClick={() => this.imgInputRef.current.click()}>{t('viewer.signatureModal.changeImage')}</Button>
      </Styled.RemoveBtnWrapper>
    ) : null;
  };

  renderActions = () => {
    const { selectedSignatureType, isDisabledButton, errorTextSignature, imageSignature } = this.state;

    return (
      <Styled.ActionWrapper>
        {selectedSignatureType === SIGNATURE_TYPE.IMAGE ? (
          this.renderChangeImageBtn(imageSignature)
        ) : (
          <>
            <Styled.FontAndColorPickerWrapper>
              <ColorPicker setOpenStyle={this.setOpenStyle} />

              {selectedSignatureType === SIGNATURE_TYPE.TYPING && (
                <FontPicker setOpenChangeFont={this.setOpenChangeFont} />
              )}
            </Styled.FontAndColorPickerWrapper>

            <Styled.RemoveBtnWrapper>
              <IconButton
                disabled={isDisabledButton && !errorTextSignature}
                aria-label="Draw"
                icon="md_trash"
                iconSize={24}
                onClick={this.clearSignature}
              />
            </Styled.RemoveBtnWrapper>
          </>
        )}
      </Styled.ActionWrapper>
    );
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  render() {
    const { isDisabled, t } = this.props;
    const { selectedSignatureType } = this.state;

    if (isDisabled) {
      return null;
    }

    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const contextValue = {
      selectedSignatureType: this.state.selectedSignatureType,
      isStartDrawSignature: this.state.isStartDrawSignature,
      signatureFont: this.state.signatureFont,
      imageSignature: this.state.imageSignature,
      errorTextSignature: this.state.errorTextSignature,
      textSignature: this.state.textSignature,
      isDisabledButton: this.state.isDisabledButton,

      handleFinishDrawing: this.handleFinishDrawing,
      handleStartDrawing: this.handleStartDrawing,
      changeFont: this.changeFont,
      handleUploadFile: this.handleUploadFile,
      setTextSignature: this.setTextSignature,
      closeModal: this.closeModal,
      createSignature: this.createSignature,

      canvas: this.canvas,
      imageSignatureRef: this.imageSignatureRef,
      imgInputRef: this.imgInputRef,
    };

    return (
      <CreateSignatureModalContentContext.Provider value={contextValue}>
        <Styled.Wrapper className="create-signature-modal-content">
          <Styled.TabsWrapper>
            <Tabs value={selectedSignatureType} onChange={(_, value) => this.changeSignatureType(value)}>
              <TabsList>
                <Tab icon="md_pen" value={SIGNATURE_TYPE.DRAW} data-cy="tab">
                  {t('action.draw')}
                </Tab>
                <Tab icon="md_image" value={SIGNATURE_TYPE.IMAGE} data-cy="tab">
                  {t('action.image')}
                </Tab>
                <Tab icon="md_font_size" value={SIGNATURE_TYPE.TYPING} data-cy="tab">
                  {t('action.type')}
                </Tab>
              </TabsList>
            </Tabs>
          </Styled.TabsWrapper>

          <div role="button" tabIndex={0} onMouseUp={this.handleFinishDrawing} onClick={this.handleClickMainContent}>
            <div>
              {this.renderActions()}

              <Measure bounds onResize={({ bounds }) => this.setState({ dimension: bounds })}>
                {({ measureRef }) => (
                  <div className="notranslate">
                    <CreateSignatureModalContentStyled.SignaturePad className={styles.canvasContainer} ref={measureRef}>
                      <canvas
                        className={classNames(styles.canvas, {
                          [styles.hidden]: selectedSignatureType !== SIGNATURE_TYPE.DRAW,
                        })}
                        ref={this.canvas}
                        onMouseUp={this.handleFinishDrawing}
                        onMouseDown={this.handleStartDrawing}
                        onTouchEnd={this.handleFinishDrawing}
                      />
                      {this.renderActionBoard()}
                    </CreateSignatureModalContentStyled.SignaturePad>
                    <PlaceMultipleTime />
                  </div>
                )}
              </Measure>
            </div>

            <Footer />
          </div>
        </Styled.Wrapper>
      </CreateSignatureModalContentContext.Provider>
    );
  }
}

const mapStateToProps = (state) => ({
  isDisabled: selectors.isElementDisabled(state, 'signatureModal'),
  isOpen: selectors.isElementOpen(state, 'signatureModal'),
  activeToolStyles: selectors.getActiveToolStyles(state),
  currentUser: selectors.getCurrentUser(state),
  currentDocument: selectors.getCurrentDocument(state),
  organizations: selectors.getOrganizationList(state),
});

const mapDispatchToProps = {
  openElement: actions.openElement,
  closeElement: actions.closeElement,
  closeElements: actions.closeElements,
  setIsSavingSignature: actions.setIsSavingSignature,
  setPlacingMultipleSignatures: actions.setPlacingMultipleSignatures,
  setSelectedSignature: actions.setSelectedSignature,
  setSignatureWidgetSelected: actions.setSignatureWidgetSelected,
};

MainContent.propTypes = propTypes;
MainContent.defaultProps = defaultProps;

export default compose(connect(mapStateToProps, mapDispatchToProps), withTranslation(), withAddSignature)(MainContent);
