import { LANGUAGES } from 'constants/language';

export const PAGE_TOOLS_TOOLS = {
  MERGE_DOCS: 'mergeDocs',
  SPLIT_EXTRACT: 'splitExtract',
  ROTATE_PAGES: 'rotatePages',
  DELETE_PAGES: 'deletePages',
  MOVE_PAGES: 'movePages',
  INSERT_BLANK_PAGES: 'insertBlankPages',
  CROP_PAGES: 'cropPages',
  PERFORM_OCR: 'performOcr',
};

export const PAGE_TOOLS_KEYWORDS = {
  [PAGE_TOOLS_TOOLS.MERGE_DOCS]: {
    [LANGUAGES.EN]: ['merge', 'combine', 'add'],
    [LANGUAGES.ES]: ['fusionar', 'combinar', 'agregar'],
    [LANGUAGES.FR]: ['fusionner', 'combiner', 'ajouter'],
    [LANGUAGES.PT]: ['mesclar', 'combinar', 'adicionar'],
    [LANGUAGES.VI]: ['ghép', 'kết hợp', 'thêm'],
  },
  [PAGE_TOOLS_TOOLS.SPLIT_EXTRACT]: {
    [LANGUAGES.EN]: ['split', 'extract', 'separate'],
    [LANGUAGES.ES]: ['dividir', 'extraer', 'separar'],
    [LANGUAGES.FR]: ['diviser', 'extraire', 'séparer'],
    [LANGUAGES.PT]: ['dividir', 'extrair', 'separar'],
    [LANGUAGES.VI]: ['tách', 'trích xuất', 'phân tách'],
  },
  [PAGE_TOOLS_TOOLS.ROTATE_PAGES]: {
    [LANGUAGES.EN]: ['rotate', 'turn', 'organize'],
    [LANGUAGES.ES]: ['rotar', 'girar', 'organizar'],
    [LANGUAGES.FR]: ['pivoter', 'tourner', 'organiser'],
    [LANGUAGES.PT]: ['girar', 'rodar', 'organizar'],
    [LANGUAGES.VI]: ['xoay', 'quay', 'sắp xếp'],
  },
  [PAGE_TOOLS_TOOLS.DELETE_PAGES]: {
    [LANGUAGES.EN]: ['delete', 'remove', 'organize'],
    [LANGUAGES.ES]: ['eliminar', 'borrar', 'organizar'],
    [LANGUAGES.FR]: ['supprimer', 'effacer', 'organiser'],
    [LANGUAGES.PT]: ['excluir', 'remover', 'organizar'],
    [LANGUAGES.VI]: ['xóa', 'loại bỏ', 'sắp xếp'],
  },
  [PAGE_TOOLS_TOOLS.MOVE_PAGES]: {
    [LANGUAGES.EN]: ['move', 'drag', 'relocate', 'organize'],
    [LANGUAGES.ES]: ['mover', 'arrastrar', 'reubicar', 'organizar'],
    [LANGUAGES.FR]: ['déplacer', 'glisser', 'relocaliser', 'organiser'],
    [LANGUAGES.PT]: ['mover', 'arrastar', 'realocar', 'organizar'],
    [LANGUAGES.VI]: ['di chuyển', 'kéo', 'đổi vị trí', 'sắp xếp'],
  },
  [PAGE_TOOLS_TOOLS.INSERT_BLANK_PAGES]: {
    [LANGUAGES.EN]: ['insert', 'add', 'blank'],
    [LANGUAGES.ES]: ['insertar', 'agregar', 'en blanco'],
    [LANGUAGES.FR]: ['insérer', 'ajouter', 'vide'],
    [LANGUAGES.PT]: ['inserir', 'adicionar', 'em branco'],
    [LANGUAGES.VI]: ['chèn', 'thêm', 'trống'],
  },
  [PAGE_TOOLS_TOOLS.CROP_PAGES]: {
    [LANGUAGES.EN]: ['crop', 'trim'],
    [LANGUAGES.ES]: ['recortar', 'ajustar'],
    [LANGUAGES.FR]: ['rogner', 'ajuster'],
    [LANGUAGES.PT]: ['cortar', 'ajustar'],
    [LANGUAGES.VI]: ['cắt', 'xén'],
  },
  [PAGE_TOOLS_TOOLS.PERFORM_OCR]: {
    [LANGUAGES.EN]: ['ocr', 'text recognition', 'extract text', 'scanned'],
    [LANGUAGES.ES]: ['ocr', 'reconocimiento de texto', 'extraer texto', 'escaneado'],
    [LANGUAGES.FR]: ['ocr', 'reconnaissance de texte', 'extraire le texte', 'numérisé'],
    [LANGUAGES.PT]: ['ocr', 'reconhecimento de texto', 'extrair texto', 'digitalizado'],
    [LANGUAGES.VI]: ['ocr', 'nhận dạng văn bản', 'trích xuất văn bản', 'quét'],
  },
};
