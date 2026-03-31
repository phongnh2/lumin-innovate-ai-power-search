import { LANGUAGES } from 'constants/language';

export const REMAINING_TOOLS = {
  RENAME_DOCUMENT: 'renameDocument',
  FOCUS_MODE: 'focusMode',
  SIGN_SECURELY: 'signSecurely',
};

export const REMAINING_TOOLS_KEYWORDS = {
  [REMAINING_TOOLS.RENAME_DOCUMENT]: {
    [LANGUAGES.EN]: ['rename', 'change name'],
    [LANGUAGES.ES]: ['renombrar', 'cambiar nombre'],
    [LANGUAGES.FR]: ['renommer', 'changer de nom'],
    [LANGUAGES.PT]: ['renomear', 'mudar nome'],
    [LANGUAGES.VI]: ['đổi tên', 'thay đổi tên'],
  },
  [REMAINING_TOOLS.FOCUS_MODE]: {
    [LANGUAGES.EN]: ['focus', 'distraction free'],
    [LANGUAGES.ES]: ['enfocar', 'sin distracciones'],
    [LANGUAGES.FR]: ['concentré', 'sans distraction'],
    [LANGUAGES.PT]: ['foco', 'sem distrações'],
    [LANGUAGES.VI]: ['tập trung', 'không phân tâm'],
  },
  [REMAINING_TOOLS.SIGN_SECURELY]: {
    [LANGUAGES.EN]: ['sign', 'secure', 'certify', 'digital signature', 'request signature'],
    [LANGUAGES.ES]: ['firmar', 'asegurar', 'certificar', 'firma digital', 'solicitar firma'],
    [LANGUAGES.FR]: ['signer', 'sécuriser', 'certifier', 'signature numérique', 'demander des signatures'],
    [LANGUAGES.PT]: ['assinar', 'seguro', 'certificar', 'assinatura digital', 'Pedir assinaturas'],
    [LANGUAGES.VI]: ['ký', 'bảo mật', 'chứng thực', 'chữ ký số', 'yêu cầu ký'],
  },
};
