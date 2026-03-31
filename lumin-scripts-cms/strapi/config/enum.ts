export enum JIRA_CARD_TYPE {
  IMPORT = "IMPORT",
  RE_IMPORT = "RE_IMPORT",
}

export enum PDF_SOURCE {
  SCRATCH = "SCRATCH",
  MANUAL_DOWNLOAD = "MANUAL_DOWNLOAD",
}

export enum PDF_LIBRARRY {
  NODE_PDFTOCAIRO = "NODE_PDFTOCAIRO",
  IMAGE_MAGICK = "IMAGE_MAGICK",
}

export enum ReviewStatus {
  READY_FOR_REVIEW = "Ready for review",
  NEEDS_RE_REVIEWING = "Needs re-reviewing",
  REVIEWED = "Reviewed",
  REJECTED = "Rejected ",
}

export enum ImportStatus {
  IMPORTED = "Imported",
  NEED_IMPORTING = "Needs importing",
  NEED_RE_IMPORTING = "Needs re-importing",
  NEED_REMOVING_FROM_STRAPI = "Needs removing from Strapi",
  RE_IMPORTED = "Re-imported",
}

export enum FileNavigation {
  Editor = "Editor",
  AG = "AG",
}

export enum Colors {
  Reset = "\x1b[0m",
  Bold = "\x1b[1m",
  Dim = "\x1b[2m",
  Cyan = "\x1b[36m",
  Blue = "\x1b[34m",
  Yellow = "\x1b[33m",
  Green = "\x1b[32m",
  Gray = "\x1b[90m",
  Red = "\x1b[31m",
}
