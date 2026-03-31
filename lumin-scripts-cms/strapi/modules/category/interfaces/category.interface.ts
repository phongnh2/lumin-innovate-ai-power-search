export interface ICategoryAttributes {
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  metaKeywords: string;
  metaTitle: string;
  metaDescription: string;
  title: string;
  heroSubCopy: string;
  whatIsForm: string;
  whatIsFormBody: string;
  luminForCategory: string;
  luminForCategoryBodyCopy: string;
  secondarySlug: string | null;
}

export interface ICategory extends ICategoryAttributes {
  id: number;
  parent: number | null;
}

export interface ICategoryResult {
  errors: string[];
  result: Pick<ICategory, "id" | "name">[];
}

export interface IStrapiCategory {
  id: number;
  attributes: ICategoryAttributes & {
    parent: { data: { id: number; attributes: ICategoryAttributes } };
  };
}

export interface IStrapiCategoryResult {
  errors: string[];
  result: IStrapiCategory[];
}
