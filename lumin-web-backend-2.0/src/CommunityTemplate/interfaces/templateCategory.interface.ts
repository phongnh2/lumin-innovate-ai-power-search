export interface ITemplateCategoryModel {
  name: string;
  slug: string;
  creator: any;
  numberTemplateBonded: number;
  lastEditorBy: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITemplateCategory extends ITemplateCategoryModel {
  _id: string;
}
