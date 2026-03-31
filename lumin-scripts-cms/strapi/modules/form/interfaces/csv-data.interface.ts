import { ImportStatus, ReviewStatus } from "@strapi/config/enum.ts";

export interface ICsvRawData {
  template_release_id?: string;
  strapi_id?: string;
  staging_strapi_id?: string;
  "Link to template in Drive "?: string;
  domain?: string;
  publish_date?: string;
  "outdated (Y/N)"?: string;
  template_rank?: string;
  template_name?: string;
  template_sub_title?: string;
  time_sensitive_grouping?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  language?: string;
  faq_publisher?: string;
  faq_who_needs_to_fill?: string;
  faq_where_to_submit?: string;
  faq_summary?: string;
  faq_country?: string;
  faq_state?: string;
  country_code?: string;
  state_code?: string;
  industry_categories?: string;
  task_categories?: string;
  form_type_filter?: string;
  "esign_compatible (Y/N)"?: string;
  "accessible (Y/N)"?: string;
  "Review status"?: string;
  "Import status"?: string;
  alt_text?: string;

  // Legacy fields
  cluster_name?: string;
  cluster_sub_title?: string;
  version_name?: string;
  version_type?: string;
  new_category_suggestion?: string;
  file_name?: string;
  pdf_file_path?: string;
  subtitle?: string;
  location?: string;
  latitude?: string;
  longitude?: string;

  [key: string]: string | undefined | boolean | ReviewStatus | ImportStatus | number | null;
}
