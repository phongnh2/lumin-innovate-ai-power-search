export interface IFormVersion {
  template_release_id: string;
  title: string;
  published_date: string;
  outdated: string;
  isPrimary: boolean;
}

export interface ITimeSensitiveGrouping {
  name: string;
  forms: IFormVersion[];
  primaryForm: IFormVersion | null;
  strapiId?: number;
}

export interface IStrapiTimeSensitiveForm {
  id: number;
  attributes?: {
    name?: string;
    forms?: {
      data: Array<{ id: number }>;
    };
  };
  name?: string;
}

export interface IStrapiForm {
  id: number;
  attributes?: {
    title?: string;
    templateReleaseId?: string;
    timeSensitiveGrouping?: {
      data: { id: number } | null;
    };
  };
  title?: string;
  templateReleaseId?: string;
}
