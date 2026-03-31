export interface ITotalDailyNewResource {
  date: string;
  total: number;
}

export interface IDocumentSummary {
  ownedDocumentTotal: number;
  sharedDocumentTotal: number;
  commentTotal: number;
  signatureTotal: number;
  annotationTotal: number;
}

export type IPersonalDocumentSummaryKeys = 'ownedDocumentTotal' | 'sharedDocumentTotal' | 'commentTotal';
export type ITeamDocumentSummaryKeys = 'ownedDocumentTotal' | 'commentTotal';
export type IOrgDocumentSummaryKeys = 'ownedDocumentTotal' | 'signatureTotal' | 'annotationTotal';

export type IPersonalDocumentSummary = Pick<IDocumentSummary, IPersonalDocumentSummaryKeys>;
export type ITeamDocumentSummary = Pick<IDocumentSummary, ITeamDocumentSummaryKeys>;
export type IOrgDocumentSummary = Pick<IDocumentSummary, IOrgDocumentSummaryKeys>;

export interface IDocumentStat {
  derivativeDocumentRate: number;
  derivativeCommentRate: number;
  derivativeSignatureRate: number;
  derivativeAnnotationRate: number;
  dailyNewComments: ITotalDailyNewResource[];
  dailyNewDocuments: ITotalDailyNewResource[];
  dailyNewSignatures: ITotalDailyNewResource[];
  dailyNewAnnotations: ITotalDailyNewResource[];
  lastUpdated: number;
}

export type IPersonalDocumentStatKeys = 'derivativeDocumentRate' | 'derivativeCommentRate' | 'dailyNewComments';

export type ITeamDocumentStatKeys = 'derivativeDocumentRate' | 'derivativeCommentRate' | 'dailyNewComments' | 'dailyNewDocuments';

export type IOrgDocumentStatKeys = 'derivativeDocumentRate' | 'derivativeSignatureRate' | 'derivativeAnnotationRate' |
  'dailyNewDocuments' | 'dailyNewSignatures' | 'dailyNewAnnotations' | 'lastUpdated';

export type IPersonalDocumentStat = Pick<IDocumentStat, IPersonalDocumentStatKeys>;
export type ITeamDocumentStat = Pick<IDocumentStat, ITeamDocumentStatKeys>;
export type IOrgDocumentStat = Pick<IDocumentStat, IOrgDocumentStatKeys>;

export interface IPersonalDocumentInsight {
  documentSummary: IPersonalDocumentSummary;
  documentStat: IPersonalDocumentStat;
}

export interface ITeamDocumentInsight {
  documentSummary: ITeamDocumentSummary;
  documentStat: ITeamDocumentStat;
}

export interface IOrgDocumentInsight {
  documentSummary: IOrgDocumentSummary;
  documentStat: IOrgDocumentStat;
}

export type IDocumentInsight = IPersonalDocumentInsight | ITeamDocumentInsight | IOrgDocumentInsight;

export interface ITeamSummary {
  teamTotal: number;
}

export interface INonDocumentStat {
  derivativeMemberRate: number;
  lastUpdated?: number;
}

export interface INonDocumentInsight {
  nonDocumentStat: INonDocumentStat,
}
