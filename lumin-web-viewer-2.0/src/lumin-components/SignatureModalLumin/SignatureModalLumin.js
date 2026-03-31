/* eslint-disable class-methods-use-this */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuList from '@mui/material/MenuList';
import classNames from 'classnames';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import { Trans } from 'react-i18next';
import Measure from 'react-measure';

import core from 'core';

import ActionButton from 'lumin-components/ActionButton';
import ButtonMaterialShared from 'lumin-components/ButtonMaterial';
import { ButtonColor } from 'lumin-components/ButtonMaterial/types/ButtonColor';
import { ButtonSize } from 'lumin-components/ButtonMaterial/types/ButtonSize';
import Icomoon from 'lumin-components/Icomoon';
import MaterialPopper from 'lumin-components/MaterialPopper';
import { Checkbox } from 'lumin-components/Shared/Checkbox';
import MenuItem from 'lumin-components/Shared/MenuItem';
import ButtonMaterial from 'lumin-components/ViewerCommon/ButtonMaterial';

import getAnnotationCenterPoint from 'helpers/getAnnotationCenterPoint';
import getClassName from 'helpers/getClassName';

import { getColorFromStyle, signature, toastUtils } from 'utils';
import { FORM_INPUT_NAME } from 'utils/Factory/EventCollection/FormEventCollection';
import { lazyWithRetry } from 'utils/lazyWithRetry';

import { withAddSignature } from 'features/Signature';

import { CUSTOM_DATA_WIDGET_ANNOTATION } from 'constants/customDataConstant';
import defaultTool from 'constants/defaultTool';
import { AnnotationSubjectMapping, ANNOTATION_ACTION } from 'constants/documentConstants';
import { images } from 'constants/documentType';
import { MAX_IMAGE_SIZE_IN_BYTES } from 'constants/fileSize';
import { LocalStorageKey } from 'constants/localStorageKey';
import { Colors, ModalTypes, MAXIMUM_NUMBER_SIGNATURE } from 'constants/lumin-common';
import { getErrorMessageMaxFieldLength } from 'constants/messages';
import { Routers } from 'constants/Routers';
import './SignatureModalLumin.scss';

const ToolStylePalette = lazyWithRetry(() => import(/* webpackPrefetch: true */ 'lumin-components/ToolStylePalette'));

const SIGNATURE_TYPE = {
  DRAW: 0,
  IMAGE: 1,
  TYPING: 2,
};

// eslint-disable-next-line prefer-regex-literals
const imageReg = new RegExp('image/'); // regular expression image
const CONVERT_TO_CANVAS_LINE_WIDTH = 3;
const SIGNATURE_ITEM_INACTIVE_CLASS = 'menu__item--inactive';
const MAX_INPUT_FIELD_LENGTH = 50;
const DEFAULT_INPUT_COLOR = 'rgba(16, 45, 66, 1)';
const DEFAULT_FILL_STYLE = 'rgba(0, 0, 0, 1)';

const CUSTOM_SIGNATURE_FONTS = [
  { value: 'DrSugiyama', name: 'Dr Sugiyama' },
  { value: 'AlexBrush', name: 'Alex Brush' },
  { value: 'DancingScript', name: 'Dancing Script' },
  { value: 'ArchitectsDaughter', name: 'Architects Daughter' },
  { value: 'HomemadeApple', name: 'Homemade Apple' },
  { value: 'RockSalt', name: 'Rock Salt' },
];
const FONT_SIZE = 100;

const maxImageSize = (sizeLimit) => sizeLimit / (1024 * 1024);

const propTypes = {
  isDisabled: PropTypes.bool,
  isOpen: PropTypes.bool,
  closeElement: PropTypes.func.isRequired,
  closeElements: PropTypes.func.isRequired,
  activeToolStyles: PropTypes.object,
  currentUser: PropTypes.object,
  currentDocument: PropTypes.object,
  navigate: PropTypes.func,
  setIsSavingSignature: PropTypes.func.isRequired,
  isPlacingMultipleSignatures: PropTypes.bool,
  setPlacingMultipleSignatures: PropTypes.func.isRequired,
  setSelectedSignature: PropTypes.func.isRequired,
  signatureWidgetSelected: PropTypes.object,
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
  navigate: () => {},
  isPlacingMultipleSignatures: false,
  signatureWidgetSelected: null,
  setSignatureWidgetSelected: () => {},
  t: () => {},
};
class SignatureModalLumin extends React.PureComponent {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
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
    this.coordinates = null;
    this.anchorEl = React.createRef();
  }

  componentDidMount() {
    this.setUpSignatureCanvas();
    this.signatureTool.addEventListener('signatureSaved', this.handleSignatureSaved);
    this.signatureTool.addEventListener('locationSelected', this.locationSelected);
    core.addEventListener('annotationChanged', this.onAnnotationChanged);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (prevState.dimension !== this.state.dimension && this.state.dimension.height && this.state.dimension.width) {
      this.signatureTool.resizeCanvas();
    }

    if (prevProps.isDisabled && !this.props.isDisabled && !this.isCanvasReady) {
      this.setUpSignatureCanvas();
    }

    if (!prevProps.isOpen && this.props.isOpen) {
      core.setToolMode('AnnotationCreateSignature');
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(this.initialState);
      this.signatureTool.clearSignatureCanvas();
      this.signatureTool.clearLocation();
      this.props.closeElements(['printModal', 'loadingModal', 'progressModal', 'errorModal']);
    }

    if (this.state.openStyle && prevProps.activeToolStyles !== this.props.activeToolStyles) {
      if (!this.signatureTool.annot || this.signatureTool.annot instanceof window.Core.Annotations.StampAnnotation) {
        return;
      }
      const {
        StrokeColor: newStrokeColor,
        StrokeThickness: newStrokeThickness,
        Opacity: newOpacity,
      } = this.props.activeToolStyles;
      this.signatureTool.annot.StrokeColor = newStrokeColor;
      this.signatureTool.annot.StrokeThickness = newStrokeThickness;
      this.signatureTool.annot.Opacity = newOpacity;
      if (!(await this.signatureTool.isEmptySignature())) {
        const ctx = this.canvas.current.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.current.width, this.canvas.current.height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = newStrokeColor.toHexString();
        ctx.lineWidth = this.signatureTool.annot.StrokeThickness * CONVERT_TO_CANVAS_LINE_WIDTH;
        ctx.globalAlpha = this.signatureTool.annot.Opacity;
        ctx.stroke();
      }
    }

    const { isOpen, currentDocument, currentUser } = this.props;
    const { premiumToolsInfo } = currentDocument;
    const signatureQuantityLimitation = get(
      premiumToolsInfo,
      'maximumNumberSignature',
      MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN
    );
    const numberSignature = signature.getNumberOfSignatures(currentUser);

    if (numberSignature >= signatureQuantityLimitation) {
      this.setState({ isDisabledButton: true });
      return;
    }
    if (isOpen) {
      const { textSignature, imageSignature, selectedSignatureType, errorTextSignature } = this.state;
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
    this.signatureTool.removeEventListener('locationSelected', this.locationSelected);
    core.removeEventListener('annotationChanged', this.onAnnotationChanged);
    this.coordinates = null;
  }

  handleSignatureSaved = (annotations) => {
    annotations.forEach((annot) => {
      this.handleSignatureAdded(annot);
    });
  };

  saveSignature = async (signatureAnnotation) => {
    this.signatureAdded = false;
    await signatureAnnotation.resourcesLoaded();
    this.props.setIsSavingSignature(false);
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

  handleSignatureAdded = async (annotation) => {
    const { setIsSavingSignature } = this.props;
    if (this.signatureAdded && annotation.ToolName === 'AnnotationCreateSignature') {
      setIsSavingSignature(true);
      this.handleCreateSignature(annotation);
      setIsSavingSignature(false);
    }
  };

  locationSelected = (pageCoordinates, widget) => {
    this.signatureWidget = widget;
    this.coordinates = {
      x: pageCoordinates.x,
      y: pageCoordinates.y,
    };
  };

  onAnnotationChanged = (annotations, action, infoObject) => {
    const annotation = annotations[0];
    const annotationManager = core.getAnnotationManager();
    if (
      this.coordinates &&
      action === ANNOTATION_ACTION.ADD &&
      annotation.Subject === AnnotationSubjectMapping.signature &&
      !infoObject?.imported &&
      !this.signatureWidget
    ) {
      annotation.X = this.coordinates.x - annotation.Width / 2;
      annotation.Y = this.coordinates.y - annotation.Height / 2;
      annotationManager.redrawAnnotation(annotation);
    }

    if (action === ANNOTATION_ACTION.DELETE && !infoObject?.imported) {
      const signatureAnnots = annotations.filter((annot) => annot.Subject === AnnotationSubjectMapping.signature);
      signatureAnnots.forEach((signature) => {
        const widgetId = signature.getCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key);
        const widget = annotationManager.getAnnotationById(widgetId);
        if (widget) {
          widget.setAssociatedSignatureAnnotation(null);
          widget.styledInnerElement();
        }
      });
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
    this.clearCanvas();
    this.signatureTool.clearLocation();
    this.props.setSignatureWidgetSelected(null);
    this.props.closeElement('signatureModal');
    core.setToolMode(defaultTool);
  };

  clearCanvas = () => {
    this.signatureTool.clearSignatureCanvas();
    this.setState(this.initialState);
  };

  clearSignature = () => {
    const { selectedSignatureType } = this.state;
    switch (selectedSignatureType) {
      case SIGNATURE_TYPE.DRAW:
        this.signatureTool.clearSignatureCanvas();
        // force to re-render even when the initialState is not changed.
        // to handle the status of the Save button.
        this.setState(this.initialState, () => this.forceUpdate());
        break;
      case SIGNATURE_TYPE.IMAGE:
        this.setState({ imageSignature: false });
        break;
      case SIGNATURE_TYPE.TYPING:
        this.setState({ textSignature: '', errorTextSignature: '' });
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
    const { closeElement, activeToolStyles } = this.props;
    const { selectedSignatureType, textSignature, signatureFont } = this.state;

    switch (selectedSignatureType) {
      case SIGNATURE_TYPE.DRAW:
        if (!(await this.signatureTool.isEmptySignature())) {
          const newSignature = this.canvas.current.toDataURL();
          await this.selectCreatedSignature(newSignature);
        }
        break;
      case SIGNATURE_TYPE.IMAGE: {
        this.clearCanvas();
        this.signatureTool.clearLocation();

        const prefixData = this.imageSignatureRef?.src.split(';')[2];

        const base64Data = this.imageSignatureRef?.src.split(';')[3];
        const imgSrc = `${prefixData};${base64Data}`;
        await this.selectCreatedSignature(imgSrc);
        break;
      }
      case SIGNATURE_TYPE.TYPING: {
        if (textSignature === '') {
          return;
        }
        this.clearCanvas();
        this.signatureTool.clearLocation();

        const multiplier = window.Core.getCanvasMultiplier();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.font = `${FONT_SIZE}px ${signatureFont}`;
        const lengthSignature = parseInt(ctx.measureText(textSignature).width);

        if (lengthSignature > this.canvas.current.width) {
          const ratio = this.canvas.current.width / this.canvas.current.height;
          canvas.width = lengthSignature * multiplier;
          canvas.height = (canvas.width / ratio) * multiplier;
        } else {
          canvas.width = this.canvas.current.width * multiplier;
          canvas.height = this.canvas.current.height * multiplier;
        }

        const { StrokeColor, Opacity, StrokeThickness } = activeToolStyles;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = StrokeColor
          ? `rgba(${StrokeColor.R},${StrokeColor.G},${StrokeColor.B},${Opacity})`
          : DEFAULT_FILL_STYLE;
        ctx.font = `${this.convertPtToFontWeight(StrokeThickness)} ${FONT_SIZE * multiplier}px ${signatureFont}`;
        ctx.fillText(textSignature, canvas.width / 2, canvas.height / 2);
        const newSignature = canvas.toDataURL();
        await this.selectCreatedSignature(newSignature);
        break;
      }
      default:
        break;
    }
    this.signatureAdded = true;
    this.handleSignatureAdded(this.signatureTool.getFullSignatureAnnotation());
    if (this.signatureWidget) {
      this.signatureTool
        .getFullSignatureAnnotation()
        .setCustomData(CUSTOM_DATA_WIDGET_ANNOTATION.WIDGET_ID.key, this.signatureWidget.Id);
      this.signatureTool.location = getAnnotationCenterPoint(this.signatureWidget);
    }
    if (this.signatureTool.hasLocation()) {
      await this.signatureTool.addSignature();
    } else {
      this.signatureTool.showPreview();
    }
    closeElement('signatureModal');
  };

  openStylePalette = () => {
    this.setState(({ openStyle }) => ({ openStyle: !openStyle }));
  };

  changeSignatureType = (type) => {
    this.setState({ ...this.initialState, selectedSignatureType: type });
    this.handleClose();
  };

  _handlePickupFile = () => {
    this.inputRef.click();
  };

  _handleUploadFile = (e) => {
    const { t } = this.props;
    const file = e.target.files[0];
    if (!imageReg.test(file.type)) {
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
        this.imageSignatureRef.src = `data:${file.type};charset=utf-8;${reader.result}`;
      };
    }
    e.target.value = null;
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
    this.handleCloseChangeFontPopper();
  };

  convertPtToFontWeight = (pt) => {
    if (pt < 6) {
      return 'normal';
    }
    return 'bold';
  };

  handleClose = () => {
    this.setState({ openStyle: false });
  };

  changeFontPopper = () => {
    this.setState(({ openChangeFont }) => ({
      openChangeFont: !openChangeFont,
    }));
  };

  handleCloseChangeFontPopper = () => {
    this.setState({
      openChangeFont: false,
    });
  };

  getNameFontByValue = (value) => {
    const result = CUSTOM_SIGNATURE_FONTS.find((font) => font.value === value);
    return result.name;
  };

  renderClassRadius = () => {
    const { selectedSignatureType } = this.state;
    if (selectedSignatureType === SIGNATURE_TYPE.DRAW) {
      return 'content__header--no-left-radius';
    }
    if (selectedSignatureType === SIGNATURE_TYPE.TYPING) {
      return 'content__header--no-right-radius';
    }
    return '';
  };

  handleClickCheckbox = () => {
    const { isPlacingMultipleSignatures, setPlacingMultipleSignatures } = this.props;
    localStorage.setItem(LocalStorageKey.IS_PLACING_MULTIPLE_SIGNATURES, !isPlacingMultipleSignatures);
    setPlacingMultipleSignatures(!isPlacingMultipleSignatures);
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  render() {
    const {
      openStyle,
      selectedSignatureType,
      imageSignature,
      signatureFont,
      textSignature,
      isDisabledButton,
      errorTextSignature,
    } = this.state;
    const {
      isDisabled,
      activeToolStyles,
      isPlacingMultipleSignatures,
      signatureWidgetSelected,
      t,
      currentDocument,
      currentUser,
    } = this.props;
    const { StrokeColor, Opacity, StrokeThickness } = activeToolStyles;
    const { premiumToolsInfo } = currentDocument;
    const className = getClassName('Modal SignatureModal', this.props);
    const signatureQuantityLimitation = get(
      premiumToolsInfo,
      'maximumNumberSignature',
      MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN
    );
    const numberSignature = signature.getNumberOfSignatures(currentUser);

    const activeColor = activeToolStyles ? getColorFromStyle(activeToolStyles) : Colors.SECONDARY;

    if (isDisabled) {
      return null;
    }
    return (
      <div className={className} onClick={(e) => e.preventDefault()}>
        <div className="container" onClick={(e) => e.stopPropagation()} onMouseUp={this.handleFinishDrawing}>
          <div className="header">
            <div className="header__container">
              <span className="label">
                {t('viewer.signatureModal.createNewSignature')}{' '}
                <span
                  className={classNames({
                    error: numberSignature >= signatureQuantityLimitation,
                    label: true,
                  })}
                >
                  {`(${numberSignature}/${
                    numberSignature > signatureQuantityLimitation ? numberSignature : signatureQuantityLimitation
                  })`}
                </span>
              </span>
              <ActionButton
                dataElement="signatureModalCloseButton"
                icon="cancel"
                iconSize={14}
                onClick={this.closeModal}
              />
            </div>
            <div id="alert">
              {numberSignature >= signatureQuantityLimitation ? (
                <>
                  <span>
                    {t('viewer.signatureModal.addedAvailableSignatures', {
                      numberSignature,
                      maxNumber: signatureQuantityLimitation,
                    })}
                  </span>
                  {numberSignature === signatureQuantityLimitation &&
                    signatureQuantityLimitation === MAXIMUM_NUMBER_SIGNATURE.FREE_PLAN && (
                      <Trans i18nKey="viewer.signatureModal.upgradeToAddSignature">
                        <span className="upgrade-message" onClick={() => this.props.navigate(Routers.PLANS)}>
                          Upgrade
                        </span>
                        <span> now to add more</span>
                      </Trans>
                    )}
                </>
              ) : (
                ''
              )}
            </div>
          </div>

          <div className="menu">
            <div className="menu__category">
              <div
                className={classNames('menu__item', {
                  [SIGNATURE_ITEM_INACTIVE_CLASS]: selectedSignatureType !== SIGNATURE_TYPE.DRAW,
                })}
              >
                <ButtonMaterial
                  aria-label="Draw"
                  className={classNames('menu__button', {
                    inactive: selectedSignatureType !== SIGNATURE_TYPE.DRAW,
                  })}
                  onClick={() => this.changeSignatureType(SIGNATURE_TYPE.DRAW)}
                >
                  <Icomoon className="edit" size={16} />
                  <span className="btn-label">{t('action.draw')}</span>
                </ButtonMaterial>
              </div>
              <div
                className={classNames('menu__item', {
                  [SIGNATURE_ITEM_INACTIVE_CLASS]: selectedSignatureType !== SIGNATURE_TYPE.IMAGE,
                })}
              >
                <ButtonMaterial
                  aria-label="Upload Image"
                  className={classNames('menu__button', {
                    inactive: selectedSignatureType !== SIGNATURE_TYPE.IMAGE,
                  })}
                  onClick={() => this.changeSignatureType(SIGNATURE_TYPE.IMAGE)}
                >
                  <Icomoon className="tool-stamp" size={16} />
                  <span className="btn-label">{t('action.image')}</span>
                </ButtonMaterial>
              </div>
              <div
                className={classNames('menu__item', {
                  [SIGNATURE_ITEM_INACTIVE_CLASS]: selectedSignatureType !== SIGNATURE_TYPE.TYPING,
                })}
              >
                <ButtonMaterial
                  aria-label="Type"
                  className={classNames('menu__button', {
                    inactive: selectedSignatureType !== SIGNATURE_TYPE.TYPING,
                  })}
                  onClick={() => this.changeSignatureType(SIGNATURE_TYPE.TYPING)}
                >
                  <Icomoon className="font-size" size={16} />
                  <span className="btn-label">{t('action.type')}</span>
                </ButtonMaterial>
              </div>
            </div>
          </div>
          <div className="content">
            <div
              className={classNames(`content__header ${this.renderClassRadius()}`, {
                'content__header--no-padding-bottom': selectedSignatureType === SIGNATURE_TYPE.IMAGE,
              })}
            >
              {selectedSignatureType !== SIGNATURE_TYPE.IMAGE ? (
                <div className="content__header--wrapper">
                  <div className="label">{t('viewer.signatureModal.changeColor')}</div>
                  <div className="ChooseStyle__wrapper" ref={(node) => (this.chooseRef = node)}>
                    <Button
                      disableRipple
                      className={classNames('ChooseStyle__btn square', {
                        active: openStyle,
                      })}
                      onClick={this.openStylePalette}
                    >
                      <Grid item className="ChooseStyle__btn--item">
                        <div className="cell" style={{ backgroundColor: activeColor }} />
                      </Grid>
                      <Grid item className="ChooseStyle__btn--item">
                        <Icomoon className="arrow-down-alt" size={8} />
                      </Grid>
                    </Button>
                  </div>
                  {selectedSignatureType === SIGNATURE_TYPE.TYPING && (
                    <div className="ChangeFont__wrapper">
                      <div className="label">{t('viewer.signatureModal.changeFont')}</div>
                      <div
                        className={classNames('FontSelect__wrapper', {
                          active: this.state.openChangeFont,
                        })}
                        ref={this.anchorEl}
                        onClick={this.changeFontPopper}
                      >
                        <span style={{ fontFamily: `"${signatureFont}", cursive` }}>
                          {this.getNameFontByValue(signatureFont)}
                        </span>
                        <Icomoon className="arrow-down-alt" size={8} />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div />
              )}
              {(!isDisabledButton || errorTextSignature) && selectedSignatureType !== SIGNATURE_TYPE.IMAGE && (
                <ButtonMaterial aria-label="Draw" className="btn--clear-canvas" onClick={this.clearSignature}>
                  <Icomoon className="trash" size={18} />
                </ButtonMaterial>
              )}
            </div>
            <Measure bounds onResize={({ bounds }) => this.setState({ dimension: bounds })}>
              {({ measureRef }) => (
                <div
                  className={classNames('signature__wrapper', {
                    'signature--image-bg': selectedSignatureType === SIGNATURE_TYPE.IMAGE,
                  })}
                >
                  <div className="signature" ref={measureRef}>
                    <canvas
                      className={classNames('signature__canvas', {
                        hidden: selectedSignatureType !== SIGNATURE_TYPE.DRAW,
                      })}
                      ref={this.canvas}
                      onMouseUp={this.handleFinishDrawing}
                      onMouseDown={this.handleStartDrawing}
                      onTouchEnd={this.handleFinishDrawing}
                    />
                    {selectedSignatureType === SIGNATURE_TYPE.DRAW && !this.state.isStartDrawSignature && (
                      <div className="signature__background">
                        <div className="sign-here">
                          <Icomoon className="moderator" size={18} />
                          {t('viewer.signatureModal.drawYourSignatureHere')}
                        </div>
                      </div>
                    )}
                    {selectedSignatureType === SIGNATURE_TYPE.IMAGE && (
                      <div className="signature__uploadfile" onClick={() => this._handlePickupFile()}>
                        <div
                          className={classNames('signature__uploadfile--text', {
                            hidden: imageSignature,
                          })}
                        >
                          <Icomoon className="cloud-arrow-up" size={20} />{' '}
                          <span className="label">{t('viewer.signatureModal.uploadImage')}</span>
                        </div>
                        <div
                          className={classNames('signature__uploadfile--text-change-img', {
                            hidden: !imageSignature,
                          })}
                        >
                          <Icomoon className="cloud-arrow-up" size={20} />{' '}
                          <span className="label">{t('viewer.signatureModal.changeImage')}</span>
                        </div>
                        <input
                          type="file"
                          id="file"
                          ref={(node) => (this.inputRef = node)}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            this._handleUploadFile(e);
                          }}
                          accept={`
                        ${images.PNG},
                        ${images.JPG},
                        ${images.JPEG},
                        `}
                        />
                        <div
                          className={classNames('signature__uploadfile--img-wrapper', {
                            hidden: !imageSignature,
                          })}
                        >
                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                          <img
                            alt="image-signature"
                            className="image-signature"
                            ref={(node) => (this.imageSignatureRef = node)}
                          />
                        </div>
                      </div>
                    )}
                    {selectedSignatureType === SIGNATURE_TYPE.TYPING && (
                      <div className="signature__typing">
                        <input
                          type="text"
                          placeholder={t('viewer.signatureModal.typeYourSignatureHere')}
                          style={{
                            fontFamily: `"${signatureFont}", cursive`,
                            fontWeight: this.convertPtToFontWeight(StrokeThickness),
                            color: StrokeColor
                              ? `rgba(${StrokeColor.R},${StrokeColor.G},${StrokeColor.B},${Opacity})`
                              : DEFAULT_INPUT_COLOR,
                          }}
                          onChange={(e) => this.setTextSignature(e)}
                          value={textSignature}
                        />
                        <div className="signature__typing signature__typing--message-wrapper">
                          {errorTextSignature ? <span className="error-message">{errorTextSignature}</span> : <span />}
                          <span>{`${textSignature.length}/${MAX_INPUT_FIELD_LENGTH}`}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={classNames('checkbox-wrapper', {
                      'checkbox-wrapper--disable': Boolean(signatureWidgetSelected),
                    })}
                  >
                    <Checkbox
                      type="checkbox"
                      className="checkbox"
                      inputProps={{
                        name: FORM_INPUT_NAME.PLACE_MULTIPLE_SIGNATURES,
                        'data-lumin-form-name': FORM_INPUT_NAME.PLACE_MULTIPLE_SIGNATURES,
                      }}
                      onChange={this.handleClickCheckbox}
                      checked={isPlacingMultipleSignatures}
                      disabled={Boolean(signatureWidgetSelected)}
                    />
                    <span className="checkbox-label">{t('common.placeSignatureMultipleTimes')}</span>
                  </div>
                </div>
              )}
            </Measure>
          </div>
          <div className="footer">
            <ButtonMaterialShared size={ButtonSize.MD} color={ButtonColor.TERTIARY} onClick={this.closeModal}>
              {t('common.cancel')}
            </ButtonMaterialShared>
            <ButtonMaterialShared size={ButtonSize.MD} onClick={this.createSignature} disabled={isDisabledButton}>
              {t('common.save')}
            </ButtonMaterialShared>
          </div>
        </div>
        {openStyle && (
          <MaterialPopper
            open={openStyle}
            anchorEl={this.chooseRef}
            classes={classNames('ChangeStyle__popper', {
              'ChangeStyle__popper--typing': selectedSignatureType === SIGNATURE_TYPE.TYPING,
              'ChangeStyle__popper--draw': selectedSignatureType === SIGNATURE_TYPE.DRAW,
            })}
            handleClose={this.handleClose}
            hasDropDownList
          >
            <ToolStylePalette hideThicknessSlider={selectedSignatureType === SIGNATURE_TYPE.TYPING} />
          </MaterialPopper>
        )}
        {this.state.openChangeFont && (
          <MaterialPopper
            open={this.state.openChangeFont}
            anchorEl={this.anchorEl.current}
            classes="ChangeFont__popper"
            handleClose={this.handleCloseChangeFontPopper}
          >
            <MenuList disablePadding>
              {CUSTOM_SIGNATURE_FONTS.map((font, idx) => (
                <MenuItem key={idx} className="ChangeFont__popper-item" onClick={() => this.changeFont(font.value)}>
                  <span className="item" style={{ fontFamily: `"${font.value}", cursive` }}>
                    {font.name}
                  </span>
                  {signatureFont === font.value && (
                    <span className="item--selected">
                      <Icomoon className="check" size={14} />
                    </span>
                  )}
                </MenuItem>
              ))}
            </MenuList>
          </MaterialPopper>
        )}
      </div>
    );
  }
}

SignatureModalLumin.propTypes = propTypes;
SignatureModalLumin.defaultProps = defaultProps;

export default withAddSignature(SignatureModalLumin);
