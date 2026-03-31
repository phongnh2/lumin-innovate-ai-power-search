import { LANGUAGES } from 'constants/language';

export const HELP_CENTER_TOOLS = {
  HELP_CENTER: 'helpCenter',
  CONTACT_SUPPORT: 'contactSupport',
  GIVE_FEEDBACK: 'giveFeedback',
};

export const HELP_CENTER_TOOLS_KEYWORDS = {
  [HELP_CENTER_TOOLS.HELP_CENTER]: {
    [LANGUAGES.EN]: ['help', 'support', 'guide'],
    [LANGUAGES.ES]: ['ayuda', 'soporte', 'guía'],
    [LANGUAGES.FR]: ['aide', 'support', 'guide'],
    [LANGUAGES.PT]: ['ajuda', 'suporte', 'guia'],
    [LANGUAGES.VI]: ['trợ giúp', 'hỗ trợ', 'hướng dẫn'],
  },
  [HELP_CENTER_TOOLS.CONTACT_SUPPORT]: {
    [LANGUAGES.EN]: ['support', 'contact', 'help', 'issue', 'bug', 'crash'],
    [LANGUAGES.ES]: ['soporte', 'contacto', 'ayuda', 'problema', 'error', 'fallo'],
    [LANGUAGES.FR]: ['support', 'contact', 'aide', 'problème', 'bogue', 'plantage'],
    [LANGUAGES.PT]: ['suporte', 'contato', 'ajuda', 'problema', 'erro', 'falha'],
    [LANGUAGES.VI]: ['hỗ trợ', 'liên hệ', 'giúp', 'vấn đề', 'lỗi', 'sập'],
  },
  [HELP_CENTER_TOOLS.GIVE_FEEDBACK]: {
    [LANGUAGES.EN]: ['feedback', 'suggest', 'report', 'issue', 'bug'],
    [LANGUAGES.ES]: ['comentarios', 'sugerir', 'informar', 'problema', 'error'],
    [LANGUAGES.FR]: ['retour', 'suggérer', 'signaler', 'problème', 'bogue'],
    [LANGUAGES.PT]: ['feedback', 'sugerir', 'relatar', 'problema', 'erro'],
    [LANGUAGES.VI]: ['phản hồi', 'đề xuất', 'báo cáo', 'vấn đề', 'lỗi'],
  },
};
