import { LANGUAGES } from 'constants/language';

export const SECURITY_TOOLS = {
  CONFIGURE_ACCESS: 'configureAccess',
  REMOVE_ACCESS: 'removeAccess',
  REDACTION: 'redaction',
};

export const SECURITY_KEYWORDS = {
  [SECURITY_TOOLS.REDACTION]: {
    [LANGUAGES.EN]: ['redact', 'hide', 'remove', 'redact', 'black out', 'hide text', 'sensitive'],
    [LANGUAGES.ES]: ['redactar', 'ocultar', 'eliminar', 'censurar', 'tachar', 'ocultar texto', 'sensible'],
    [LANGUAGES.FR]: ['masquer', 'cacher', 'supprimer', 'censurer', 'noircir', 'cacher texte', 'sensible'],
    [LANGUAGES.PT]: ['redação', 'ocultar', 'remover', 'censurar', 'apagar', 'ocultar texto', 'sensível'],
    [LANGUAGES.VI]: ['che', 'ẩn', 'xóa', 'che đen', 'che khuất', 'ẩn văn bản', 'nhạy cảm'],
  },
  [SECURITY_TOOLS.CONFIGURE_ACCESS]: {
    [LANGUAGES.EN]: ['set', 'protect', 'secure', 'password', 'protect', 'security', 'lock'],
    [LANGUAGES.ES]: ['establecer', 'proteger', 'asegurar', 'contraseña', 'proteger', 'seguridad', 'bloquear'],
    [LANGUAGES.FR]: ['définir', 'protéger', 'sécuriser', 'mot de passe', 'protéger', 'sécurité', 'verrouiller'],
    [LANGUAGES.PT]: ['definir', 'proteger', 'assegurar', 'senha', 'proteger', 'segurança', 'bloquear'],
    [LANGUAGES.VI]: ['đặt', 'bảo vệ', 'bảo mật', 'mật khẩu', 'bảo vệ', 'an ninh', 'khóa'],
  },
  [SECURITY_TOOLS.REMOVE_ACCESS]: {
    [LANGUAGES.EN]: ['remove', 'unlock', 'remove password', 'unlock', 'security'],
    [LANGUAGES.ES]: ['eliminar', 'desbloquear', 'eliminar contraseña', 'desbloquear', 'seguridad'],
    [LANGUAGES.FR]: ['supprimer', 'déverrouiller', 'supprimer mot de passe', 'déverrouiller', 'sécurité'],
    [LANGUAGES.PT]: ['remover', 'desbloquear', 'remover senha', 'desbloquear', 'segurança'],
    [LANGUAGES.VI]: ['xóa', 'mở khóa', 'xóa mật khẩu', 'mở khóa', 'bảo mật'],
  },
};
