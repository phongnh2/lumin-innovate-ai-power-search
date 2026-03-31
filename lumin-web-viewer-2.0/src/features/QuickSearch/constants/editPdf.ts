import { LANGUAGES } from 'constants/language';

export const EDIT_PDF_TOOLS = {
  EDIT_CONTENT: 'editContent',
  ADD_PARAGRAPH: 'addParagraph',
};

export const EDIT_PDF_KEYWORDS = {
  [EDIT_PDF_TOOLS.EDIT_CONTENT]: {
    [LANGUAGES.EN]: ['edit', 'modify', 'edit text', 'content'],
    [LANGUAGES.ES]: ['editar', 'modificar', 'editar texto', 'contenido'],
    [LANGUAGES.FR]: ['éditer', 'modifier', 'éditer texte', 'contenu'],
    [LANGUAGES.PT]: ['editar', 'modificar', 'editar texto', 'conteúdo'],
    [LANGUAGES.VI]: ['chỉnh sửa', 'sửa đổi', 'sửa văn bản', 'nội dung'],
  },
  [EDIT_PDF_TOOLS.ADD_PARAGRAPH]: {
    [LANGUAGES.EN]: ['add', 'insert', 'type', 'paragraph'],
    [LANGUAGES.ES]: ['agregar', 'insertar', 'escribir', 'párrafo'],
    [LANGUAGES.FR]: ['ajouter', 'insérer', 'taper', 'paragraphe'],
    [LANGUAGES.PT]: ['adicionar', 'inserir', 'digitar', 'parágrafo'],
    [LANGUAGES.VI]: ['thêm', 'chèn', 'nhập', 'đoạn văn'],
  },
};
