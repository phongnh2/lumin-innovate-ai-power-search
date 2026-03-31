export const PremiumToolsPopOverEvent = {
  Redaction: 'redact',
  EditPdf: 'editPdf',
  FormBuilder: 'formBuilder',
  OCR: 'OCR',
  RubberStamp: 'rubberStamp',
  SummarizeDocument: 'summarizeDocument',
  PasswordProtection: 'passwordProtection',
  SplitPage: 'splitExtract',
  MergePage: 'merge',
} as const;

export type PremiumToolsPopOverEventType = typeof PremiumToolsPopOverEvent[keyof typeof PremiumToolsPopOverEvent];
