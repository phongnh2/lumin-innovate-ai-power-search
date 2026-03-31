export enum PrimaryCategory {
  Industry = "industryCategories",
  Task = "taskCategories",
}

export enum MobilePrimaryCategory {
  Industry = "industryCategories",
  Task = "taskCategories",
  FormType = "formTypeCategories",
}

export enum TextPrimaryCategoryValues {
  Industry = "Industry",
  Task = "Task",
  FormType = "Form type",
}

export enum TextCategoryValues {
  Category = "Category",
}

export enum CategorySlug {
  Administration = "administration",
}

export const TextPrimaryCategory = {
  [PrimaryCategory.Industry]: TextCategoryValues.Category,
  [PrimaryCategory.Task]: TextPrimaryCategoryValues.Task,
  [MobilePrimaryCategory.FormType]: TextPrimaryCategoryValues.FormType,
};

export const CATEGORIES_WITH_DEFAULT_MOST_RECENT_SORT = ["tax"];

export enum MeilisearchCategoryAttr {
  Id = "id",
  Name = "name",
  Slug = "slug",
  TotalForms = "totalForms",
  Parent = "parent",
  MetaTitle = "metaTitle",
  MetaDescription = "metaDescription",
  MetaKeywords = "metaKeywords",
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
  PublishedAt = "publishedAt",
  Title = "title",
  SubTitle = "subTitle",
  HeroSubCopy = "heroSubCopy",
  WhatIsForm = "whatIsForm",
  WhatIsFormBody = "whatIsFormBody",
  LuminForCategory = "luminForCategory",
  LuminForCategoryBodyCopy = "luminForCategoryBodyCopy",
  Faqs = "faqs",
}

export const ABBREVIATION_CATEGORY_SLUG = ["hr", "it"];
