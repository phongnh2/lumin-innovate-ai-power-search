import { LANGUAGES } from 'constants/language';

export const CHATBOT_COMMAND_TOOLS = {
  SUMMARY_DOCUMENT: 'summaryDocument',
  ASK_ABOUT_DOCUMENT: 'askAboutDocument',
  REDACT_SENSITIVE_INFO: 'redactSensitiveInfo',
};

export const CHATBOT_COMMAND_KEYWORDS = {
  [CHATBOT_COMMAND_TOOLS.SUMMARY_DOCUMENT]: {
    [LANGUAGES.EN]: ['summary', 'summarize', 'overview'],
    [LANGUAGES.ES]: ['resumen', 'resumir', 'visión general'],
    [LANGUAGES.FR]: ['résumé', 'résumer', 'aperçu'],
    [LANGUAGES.PT]: ['resumo', 'resumir', 'visão geral'],
    [LANGUAGES.VI]: ['tóm tắt', 'tổng quan', 'tổng quát'],
  },
  [CHATBOT_COMMAND_TOOLS.ASK_ABOUT_DOCUMENT]: {
    [LANGUAGES.EN]: ['ask', 'question', 'inquire'],
    [LANGUAGES.ES]: ['preguntar', 'consultar', 'indagar'],
    [LANGUAGES.FR]: ['demander', 'question', 'interroger'],
    [LANGUAGES.PT]: ['perguntar', 'questionar', 'consultar'],
    [LANGUAGES.VI]: ['hỏi', 'câu hỏi', 'thắc mắc'],
  },
  [CHATBOT_COMMAND_TOOLS.REDACT_SENSITIVE_INFO]: {
    [LANGUAGES.EN]: ['redact', 'sensitive', 'hide', 'mask', 'remove'],
    [LANGUAGES.ES]: ['redactar', 'sensible', 'ocultar', 'enmascarar', 'eliminar'],
    [LANGUAGES.FR]: ['masquer', 'sensible', 'cacher', 'masquer', 'supprimer'],
    [LANGUAGES.PT]: ['redatar', 'sensível', 'ocultar', 'mascarar', 'remover'],
    [LANGUAGES.VI]: ['che', 'nhạy cảm', 'ẩn', 'che đậy', 'xóa'],
  },
};
