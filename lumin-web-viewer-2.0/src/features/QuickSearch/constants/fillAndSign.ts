/* eslint-disable prettier/prettier */
/* eslint-disable sonarjs/no-duplicate-string */
import { LANGUAGES } from 'constants/language';

export const FILL_AND_SIGN_TOOLS = {
  SIGNATURE: 'signature',
  DATE: 'date',
  STAMP: 'stamp',
  DOT: 'dot',
  TICK: 'tick',
  CROSS: 'cross',
  CUSTOMIZE_FIELDS: 'customizeFields',
  AUTO_DETECT_FIELDS: 'autoDetectFields',
};

export const FILL_AND_SIGN_KEYWORDS = {
  [FILL_AND_SIGN_TOOLS.SIGNATURE]: {
    [LANGUAGES.EN]: ['insert', 'sign', 'add', 'signature', 'add signature'],
    [LANGUAGES.ES]: ['insertar', 'firmar', 'agregar', 'firma', 'agregar firma'],
    [LANGUAGES.FR]: ['insérer', 'signer', 'ajouter', 'signature', 'ajouter signature'],
    [LANGUAGES.PT]: ['inserir', 'assinar', 'adicionar', 'assinatura', 'adicionar assinatura'],
    [LANGUAGES.VI]: ['chèn', 'ký', 'thêm', 'chữ ký', 'thêm chữ ký'],
  },
  [FILL_AND_SIGN_TOOLS.DATE]: {
    [LANGUAGES.EN]: ['insert', 'add', 'date', 'insert date', 'timestamp', 'fill', 'form'],
    [LANGUAGES.ES]: ['insertar', 'agregar', 'fecha', 'insertar fecha', 'marca de tiempo', 'llenar', 'formulario'],
    [LANGUAGES.FR]: ['insérer', 'ajouter', 'date', 'insérer date', 'horodatage', 'remplir', 'formulaire'],
    [LANGUAGES.PT]: ['inserir', 'adicionar', 'data', 'inserir data', 'carimbo de data', 'preencher', 'formulário'],
    [LANGUAGES.VI]: ['chèn', 'thêm', 'ngày', 'chèn ngày', 'dấu thời gian', 'điền', 'biểu mẫu'],
  },
  [FILL_AND_SIGN_TOOLS.STAMP]: {
    [LANGUAGES.EN]: ['insert', 'add', 'place', 'stamp', 'approved', 'rejected', 'mark'],
    [LANGUAGES.ES]: ['insertar', 'agregar', 'colocar', 'sello', 'aprobado', 'rechazado', 'marcar'],
    [LANGUAGES.FR]: ['insérer', 'ajouter', 'placer', 'tampon', 'approuvé', 'rejeté', 'marquer'],
    [LANGUAGES.PT]: ['inserir', 'adicionar', 'colocar', 'carimbo', 'aprovado', 'rejeitado', 'marcar'],
    [LANGUAGES.VI]: ['chèn', 'thêm', 'đặt', 'con dấu', 'đã duyệt', 'từ chối', 'đánh dấu'],
  },
  [FILL_AND_SIGN_TOOLS.DOT]: {
    [LANGUAGES.EN]: ['insert', 'mark', 'dot', 'point', 'fill', 'form'],
    [LANGUAGES.ES]: ['insertar', 'marcar', 'punto', 'llenar', 'formulario'],
    [LANGUAGES.FR]: ['insérer', 'marquer', 'point', 'remplir', 'formulaire'],
    [LANGUAGES.PT]: ['inserir', 'marcar', 'ponto', 'preencher', 'formulário'],
    [LANGUAGES.VI]: ['chèn', 'đánh dấu', 'chấm', 'điểm', 'điền', 'biểu mẫu'],
  },
  [FILL_AND_SIGN_TOOLS.TICK]: {
    [LANGUAGES.EN]: ['insert', 'mark', 'tick', 'check', 'fill', 'form'],
    [LANGUAGES.ES]: ['insertar', 'marcar', 'marca', 'verificar', 'llenar', 'formulario'],
    [LANGUAGES.FR]: ['insérer', 'marquer', 'coche', 'vérifier', 'remplir', 'formulaire'],
    [LANGUAGES.PT]: ['inserir', 'marcar', 'marca', 'verificar', 'preencher', 'formulário'],
    [LANGUAGES.VI]: ['chèn', 'đánh dấu', 'dấu tích', 'kiểm tra', 'điền', 'biểu mẫu'],
  },
  [FILL_AND_SIGN_TOOLS.CROSS]: {
    [LANGUAGES.EN]: ['insert', 'mark', 'cross', 'x mark', 'reject', 'fill', 'form'],
    [LANGUAGES.ES]: ['insertar', 'marcar', 'cruz', 'marca x', 'rechazar', 'llenar', 'formulario'],
    [LANGUAGES.FR]: ['insérer', 'marquer', 'croix', 'marque x', 'rejeter', 'remplir', 'formulaire'],
    [LANGUAGES.PT]: ['inserir', 'marcar', 'cruz', 'marca x', 'rejeitar', 'preencher', 'formulário'],
    [LANGUAGES.VI]: ['chèn', 'đánh dấu', 'dấu chéo', 'dấu x', 'từ chối', 'điền', 'biểu mẫu'],
  },
  [FILL_AND_SIGN_TOOLS.CUSTOMIZE_FIELDS]: {
    [LANGUAGES.EN]: ['form builder', 'build', 'form', 'text field', 'checkbox field', 'radio button field', 'field', 'edit'],
    [LANGUAGES.ES]: ['constructor de formularios', 'construir', 'formulario', 'campo de texto', 'casilla de verificación', 'botón de radio', 'campo', 'editar'],
    [LANGUAGES.FR]: ['constructeur de formulaire', 'construire', 'formulaire', 'champ de texte', 'case à cocher', 'bouton radio', 'champ', 'éditer'],
    [LANGUAGES.PT]: ['construtor de formulário', 'construir', 'formulário', 'campo de texto', 'caixa de seleção', 'botão de opção', 'campo', 'editar'],
    [LANGUAGES.VI]: ['tạo biểu mẫu', 'xây dựng', 'biểu mẫu', 'trường văn bản', 'hộp kiểm', 'nút radio', 'trường', 'chỉnh sửa'],
  },
  [FILL_AND_SIGN_TOOLS.AUTO_DETECT_FIELDS]: {
    [LANGUAGES.EN]: ['detect', 'identify', 'auto', 'fillable field', 'field', 'form builder', 'build', 'edit'],
    [LANGUAGES.ES]: ['detectar', 'identificar', 'auto', 'campo rellenable', 'campo', 'constructor de formularios', 'construir', 'editar'],
    [LANGUAGES.FR]: ['détecter', 'identifier', 'auto', 'champ remplissable', 'champ', 'constructeur de formulaire', 'construire', 'éditer'],
    [LANGUAGES.PT]: ['detectar', 'identificar', 'auto', 'campo preenchível', 'campo', 'construtor de formulário', 'construir', 'editar'],
    [LANGUAGES.VI]: ['phát hiện', 'nhận dạng', 'tự động', 'trường điền được', 'trường', 'tạo biểu mẫu', 'xây dựng', 'chỉnh sửa'],
  },
};
