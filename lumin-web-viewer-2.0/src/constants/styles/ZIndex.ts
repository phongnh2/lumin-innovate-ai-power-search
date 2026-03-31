export enum ZIndex {
  RATING_MODAL = 'var(--rating-modal)',
  POPOVER = 'var(--zindex-popover)',
  NOTIFICATION_MESSAGES = 'var(--zindex-notification-messages)',
  UPLOAD_MODAL = 'var(--zindex-upload-modal)',
  WIDGET_NOTIFICATION_ICON = 'var(--zindex-widget-notification-icon)',
  RIGHT_SIDE_BAR = 'var(--zindex-right-side-bar)',
  BOOK_MARK = 'var(--zindex-book-mark)',
  LUMIN_RIGHT_PANEL = 'var(--zindex-comment-panel)',
  MENTION_COMMENT_POPUP = 'var(--zindex-mention-comment-popup)',
  LUMIN_BASE_SIDE_BAR = 'var(--lumin-base-side-bar-z-index)',
  LUMIN_TOOL_BAR = 'var(--z-index-lumin-tool-bar)',
  LUMIN_HEADER_BAR = 'var(--z-index-lumin-header-bar)',

}

export type ZIndexKey = keyof typeof ZIndex;
