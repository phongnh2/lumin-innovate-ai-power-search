import { JIRA_CARD_TYPE } from "@strapi/config/enum.ts";
import { CONFIGURATION } from "@strapi/config/settings.ts";
import { IMappingTemplateId } from "../interfaces/index.ts";
import { loadCurrentForms } from "./form-data.helper.ts";
import { readJsonFile } from "@strapi/utils/file.ts";

export async function getFormIdByTemplateReleaseId(
  templateReleaseId: number,
): Promise<number | null> {
  const currentForms = await loadCurrentForms();
  const mappingPath = `${Deno.cwd()}/${CONFIGURATION.MAPPING_TEMPLATE_ID_JSON_PATH}`;
  const findTemplateId = async (releaseId: number): Promise<number | null> => {
    switch (CONFIGURATION.JIRA_CART_IMPORT_TYPE) {
      case JIRA_CARD_TYPE.IMPORT: {
        const mappingData = await readJsonFile(
          mappingPath,
          [],
        ) as IMappingTemplateId[];
        const template = mappingData.find(
          (item) => item.templateReleaseId === releaseId,
        );
        return template && template.templateId ? template.templateId : null;
      }
      case JIRA_CARD_TYPE.RE_IMPORT:
      default: {
        const existingTemplate = currentForms.find(
          (form) => Number(form.templateReleaseId) === releaseId,
        );
        return existingTemplate?.id ?? 0;
      }
    }
  };

  return findTemplateId(templateReleaseId);
}
