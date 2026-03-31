export enum MeilisearchTemplateAttr {
  Id = "id",
  Title = "title",
  Subtitle = "subTitle",
  Description = "description",
  Slug = "slug",
  Domain = "domain",
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
  Categories = "categories",
  CollectionPages = "collection_pages",
  TotalUsed = "totalUsed",
  Accessible = "accessible",
  ESignCompatible = "eSignCompatible",
  PrimaryTaskCategory = "primaryTaskCategory",
  PrimaryIndustryCategory = "primaryIndustryCategory",
  PrimaryFormTypeFilterCategory = "primaryFormTypeFilterCategory",
  RelatedForms = "relatedForms",
  Language = "language",

  MetaTitle = "metaTitle",
  MetaDescription = "metaDescription",
  MetaKeywords = "metaKeywords",

  Thumbnails = "thumbnails",
  ThumbnailUrl = "url",
  ThumbnailAlt = "alt",

  FaqSummary = "faqSummary",
  FaqWhoNeedsToFill = "faqWhoNeedsToFill",
  FaqWhereToSubmit = "faqWhereToSubmit",

  FormTypesName = "formTypes.name",
  CountryCode = "countryCode",
  StateCode = "stateCode",

  SearchTerms = "searchTerms",

  TimeSensitiveGrouping = "timeSensitiveGrouping",
}

export enum MeilisearchCategoryAttr {
  Id = "id",
  Name = "name",
  CreatedAt = "createdAt",
  UpdatedAt = "updatedAt",
  Slug = "slug",
  MetaDescription = "metaDescription",
  Title = "title",
  HeroSubCopy = "heroSubCopy",
  WhatIsForm = "whatIsForm",
  WhatIsFormBody = "whatIsFormBody",
  LuminForCategory = "luminForCategory",
  LuminForCategoryBodyCopy = "luminForCategoryBodyCopy",
  MetaKeywords = "metaKeywords",
  TotalForms = "totalForms",

  // Populate fields
  Parent = "parent",
  Forms = "forms",

  SearchTerms = "searchTerms",

  Code = "code",
  States = "states",
}
