import { LANGUAGES } from 'constants/language';

export const FILE_MENU_TOOLS = {
  ADD_TO_STARRED: 'addToStarred',
  MAKE_COPY: 'makeCopy',
  MOVE_DOCUMENT: 'moveDocument',
  DOWNLOAD: 'download',
  AVAILABLE_OFFLINE: 'availableOffline',
  AUTO_SYNC: 'autoSync',
  DARK_MODE: 'darkMode',
  FULL_SCREEN: 'fullScreen',
  PRESENTER_MODE: 'presenterMode',
  FILE_INFO: 'fileInfo',
  VERSION_HISTORY: 'versionHistory',
};

export const FILE_MENU_TOOLS_KEYWORDS = {
  [FILE_MENU_TOOLS.ADD_TO_STARRED]: {
    [LANGUAGES.EN]: ['star', 'favorite', 'mark'],
    [LANGUAGES.ES]: ['estrella', 'favorito', 'marcar'],
    [LANGUAGES.FR]: ['étoile', 'favori', 'marquer'],
    [LANGUAGES.PT]: ['estrela', 'favorito', 'marcar'],
    [LANGUAGES.VI]: ['gắn sao', 'yêu thích', 'đánh dấu'],
  },
  [FILE_MENU_TOOLS.MAKE_COPY]: {
    [LANGUAGES.EN]: ['copy', 'duplicate'],
    [LANGUAGES.ES]: ['copiar', 'duplicar'],
    [LANGUAGES.FR]: ['copier', 'dupliquer'],
    [LANGUAGES.PT]: ['copiar', 'duplicar'],
    [LANGUAGES.VI]: ['sao chép', 'nhân bản'],
  },
  [FILE_MENU_TOOLS.MOVE_DOCUMENT]: {
    [LANGUAGES.EN]: ['move', 'drag', 'relocate', 'organize'],
    [LANGUAGES.ES]: ['mover', 'arrastrar', 'reubicar', 'organizar'],
    [LANGUAGES.FR]: ['déplacer', 'glisser', 'relocaliser', 'organiser'],
    [LANGUAGES.PT]: ['mover', 'arrastar', 'realocar', 'organizar'],
    [LANGUAGES.VI]: ['di chuyển', 'kéo', 'đổi vị trí', 'sắp xếp'],
  },
  [FILE_MENU_TOOLS.DOWNLOAD]: {
    [LANGUAGES.EN]: ['download', 'export', 'save'],
    [LANGUAGES.ES]: ['descargar', 'exportar', 'guardar'],
    [LANGUAGES.FR]: ['télécharger', 'exporter', 'sauvegarder'],
    [LANGUAGES.PT]: ['baixar', 'exportar', 'salvar'],
    [LANGUAGES.VI]: ['tải xuống', 'xuất', 'lưu'],
  },
  [FILE_MENU_TOOLS.AUTO_SYNC]: {
    [LANGUAGES.EN]: ['sync', 'auto sync', 'google', 'save'],
    [LANGUAGES.ES]: ['sincronizar', 'sincronización automática', 'google', 'guardar'],
    [LANGUAGES.FR]: ['synchroniser', 'synchronisation auto', 'google', 'sauvegarder'],
    [LANGUAGES.PT]: ['sincronizar', 'sincronização automática', 'google', 'salvar'],
    [LANGUAGES.VI]: ['đồng bộ', 'tự động đồng bộ', 'google', 'lưu'],
  },
  [FILE_MENU_TOOLS.DARK_MODE]: {
    [LANGUAGES.EN]: ['dark mode', 'light mode', 'theme', 'day', 'night'],
    [LANGUAGES.ES]: ['modo oscuro', 'modo claro', 'tema', 'día', 'noche'],
    [LANGUAGES.FR]: ['mode sombre', 'mode clair', 'thème', 'jour', 'nuit'],
    [LANGUAGES.PT]: ['modo escuro', 'modo claro', 'tema', 'dia', 'noite'],
    [LANGUAGES.VI]: ['chế độ tối', 'chế độ sáng', 'giao diện', 'ban ngày', 'ban đêm'],
  },
  [FILE_MENU_TOOLS.FULL_SCREEN]: {
    [LANGUAGES.EN]: ['fullscreen', 'expand', 'view'],
    [LANGUAGES.ES]: ['pantalla completa', 'expandir', 'ver'],
    [LANGUAGES.FR]: ['plein écran', 'agrandir', 'voir'],
    [LANGUAGES.PT]: ['tela cheia', 'expandir', 'visualizar'],
    [LANGUAGES.VI]: ['toàn màn hình', 'mở rộng', 'xem'],
  },
  [FILE_MENU_TOOLS.PRESENTER_MODE]: {
    [LANGUAGES.EN]: ['present', 'presentation', 'mode'],
    [LANGUAGES.ES]: ['presentar', 'presentación', 'modo'],
    [LANGUAGES.FR]: ['présenter', 'présentation', 'mode'],
    [LANGUAGES.PT]: ['apresentar', 'apresentação', 'modo'],
    [LANGUAGES.VI]: ['trình chiếu', 'thuyết trình', 'chế độ'],
  },
  [FILE_MENU_TOOLS.FILE_INFO]: {
    [LANGUAGES.EN]: ['file info', 'properties', 'metadata'],
    [LANGUAGES.ES]: ['información del archivo', 'propiedades', 'metadatos'],
    [LANGUAGES.FR]: ['info fichier', 'propriétés', 'métadonnées'],
    [LANGUAGES.PT]: ['informações do arquivo', 'propriedades', 'metadados'],
    [LANGUAGES.VI]: ['thông tin tập tin', 'thuộc tính', 'siêu dữ liệu'],
  },
  [FILE_MENU_TOOLS.VERSION_HISTORY]: {
    [LANGUAGES.EN]: ['history', 'versions', 'changes'],
    [LANGUAGES.ES]: ['historial', 'versiones', 'cambios'],
    [LANGUAGES.FR]: ['historique', 'versions', 'modifications'],
    [LANGUAGES.PT]: ['histórico', 'versões', 'alterações'],
    [LANGUAGES.VI]: ['lịch sử', 'phiên bản', 'thay đổi'],
  },
};
