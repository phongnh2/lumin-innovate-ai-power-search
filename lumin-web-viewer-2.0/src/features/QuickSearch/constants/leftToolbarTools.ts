/* eslint-disable sonarjs/no-duplicate-string */
import { LANGUAGES } from 'constants/language';

export const LEFT_TOOLBAR_TOOLS = {
  THUMBNAILS: 'thumbnails',
  OUTLINES: 'outlines',
  READ_ALOUD: 'readAloud',
  VIEW_CONTROL: 'viewControl',
  SELECT: 'select',
  PAN: 'pan',
  UNDO: 'undo',
  REDO: 'redo',
  SINGLE_VIEW: 'singleView',
  GRID_VIEW: 'gridView',
};

export const LEFT_TOOLBAR_TOOLS_KEYWORDS = {
  [LEFT_TOOLBAR_TOOLS.THUMBNAILS]: {
    [LANGUAGES.EN]: ['thumbnails', 'preview', 'pages'],
    [LANGUAGES.ES]: ['miniaturas', 'vista previa', 'páginas'],
    [LANGUAGES.FR]: ['vignettes', 'aperçu', 'pages'],
    [LANGUAGES.PT]: ['miniaturas', 'pré-visualização', 'páginas'],
    [LANGUAGES.VI]: ['hình thu nhỏ', 'xem trước', 'trang'],
  },
  [LEFT_TOOLBAR_TOOLS.OUTLINES]: {
    [LANGUAGES.EN]: ['outline', 'bookmarks', 'sections'],
    [LANGUAGES.ES]: ['esquema', 'marcadores', 'secciones'],
    [LANGUAGES.FR]: ['plan', 'signets', 'sections'],
    [LANGUAGES.PT]: ['esquema', 'marcadores', 'seções'],
    [LANGUAGES.VI]: ['đề cương', 'dấu trang', 'mục lục'],
  },
  [LEFT_TOOLBAR_TOOLS.READ_ALOUD]: {
    [LANGUAGES.EN]: ['read', 'text to speech', 'audio'],
    [LANGUAGES.ES]: ['leer', 'texto a voz', 'audio'],
    [LANGUAGES.FR]: ['lire', 'synthèse vocale', 'audio'],
    [LANGUAGES.PT]: ['ler', 'texto para fala', 'áudio'],
    [LANGUAGES.VI]: ['đọc', 'chuyển văn bản thành giọng nói', 'âm thanh'],
  },
  [LEFT_TOOLBAR_TOOLS.VIEW_CONTROL]: {
    [LANGUAGES.EN]: ['view', 'zoom', 'layout'],
    [LANGUAGES.ES]: ['vista', 'zoom', 'diseño'],
    [LANGUAGES.FR]: ['vue', 'zoom', 'mise en page'],
    [LANGUAGES.PT]: ['visualização', 'zoom', 'layout'],
    [LANGUAGES.VI]: ['xem', 'phóng to', 'bố cục'],
  },
  [LEFT_TOOLBAR_TOOLS.SELECT]: {
    [LANGUAGES.EN]: ['select', 'choose', 'highlight'],
    [LANGUAGES.ES]: ['seleccionar', 'elegir', 'resaltar'],
    [LANGUAGES.FR]: ['sélectionner', 'choisir', 'surligner'],
    [LANGUAGES.PT]: ['selecionar', 'escolher', 'destacar'],
    [LANGUAGES.VI]: ['chọn', 'lựa chọn', 'tô sáng'],
  },
  [LEFT_TOOLBAR_TOOLS.PAN]: {
    [LANGUAGES.EN]: ['pan', 'move view'],
    [LANGUAGES.ES]: ['desplazar', 'mover vista'],
    [LANGUAGES.FR]: ['panoramique', 'déplacer la vue'],
    [LANGUAGES.PT]: ['panorâmica', 'mover visualização'],
    [LANGUAGES.VI]: ['di chuyển', 'di chuyển khung nhìn'],
  },
  [LEFT_TOOLBAR_TOOLS.UNDO]: {
    [LANGUAGES.EN]: ['undo', 'revert', 'back'],
    [LANGUAGES.ES]: ['deshacer', 'revertir', 'atrás'],
    [LANGUAGES.FR]: ['annuler', 'rétablir', 'retour'],
    [LANGUAGES.PT]: ['desfazer', 'reverter', 'voltar'],
    [LANGUAGES.VI]: ['hoàn tác', 'quay lại', 'trở lại'],
  },
  [LEFT_TOOLBAR_TOOLS.REDO]: {
    [LANGUAGES.EN]: ['redo', 'repeat', 'forward'],
    [LANGUAGES.ES]: ['rehacer', 'repetir', 'adelante'],
    [LANGUAGES.FR]: ['rétablir', 'répéter', 'avant'],
    [LANGUAGES.PT]: ['refazer', 'repetir', 'avançar'],
    [LANGUAGES.VI]: ['làm lại', 'lặp lại', 'tiếp tục'],
  },
  [LEFT_TOOLBAR_TOOLS.SINGLE_VIEW]: {
    [LANGUAGES.EN]: ['view', 'layout'],
    [LANGUAGES.ES]: ['vista', 'diseño'],
    [LANGUAGES.FR]: ['vue', 'mise en page'],
    [LANGUAGES.PT]: ['visualização', 'layout'],
    [LANGUAGES.VI]: ['xem', 'bố cục'],
  },
  [LEFT_TOOLBAR_TOOLS.GRID_VIEW]: {
    [LANGUAGES.EN]: ['view', 'layout'],
    [LANGUAGES.ES]: ['vista', 'diseño'],
    [LANGUAGES.FR]: ['vue', 'mise en page'],
    [LANGUAGES.PT]: ['visualização', 'layout'],
    [LANGUAGES.VI]: ['xem', 'bố cục'],
  },
};
