import { LANGUAGES } from 'constants/language';

export const RIGHT_SIDE_BAR_TOOLS = {
  AI_ASSISTANT: 'aiAssistant',
  COMMENT_HISTORY: 'commentHistory',
  PRINT: 'print',
};

export const RIGHT_SIDE_BAR_TOOLS_KEYWORDS = {
  [RIGHT_SIDE_BAR_TOOLS.AI_ASSISTANT]: {
    [LANGUAGES.EN]: ['ai', 'assistant', 'help', 'chatbot', 'automation'],
    [LANGUAGES.ES]: ['ia', 'asistente', 'ayuda', 'chatbot', 'automatización'],
    [LANGUAGES.FR]: ['ia', 'assistant', 'aide', 'chatbot', 'automatisation'],
    [LANGUAGES.PT]: ['ia', 'assistente', 'ajuda', 'chatbot', 'automação'],
    [LANGUAGES.VI]: ['ai', 'trợ lý', 'giúp', 'chatbot', 'tự động hóa'],
  },
  [RIGHT_SIDE_BAR_TOOLS.COMMENT_HISTORY]: {
    [LANGUAGES.EN]: ['comments', 'history', 'notes'],
    [LANGUAGES.ES]: ['comentarios', 'historial', 'notas'],
    [LANGUAGES.FR]: ['commentaires', 'historique', 'notes'],
    [LANGUAGES.PT]: ['comentários', 'histórico', 'notas'],
    [LANGUAGES.VI]: ['bình luận', 'lịch sử', 'ghi chú'],
  },
  [RIGHT_SIDE_BAR_TOOLS.PRINT]: {
    [LANGUAGES.EN]: ['print', 'hard copy'],
    [LANGUAGES.ES]: ['imprimir', 'copia impresa'],
    [LANGUAGES.FR]: ['imprimer', 'copie papier'],
    [LANGUAGES.PT]: ['imprimir', 'cópia física'],
    [LANGUAGES.VI]: ['in', 'bản cứng'],
  },
};
