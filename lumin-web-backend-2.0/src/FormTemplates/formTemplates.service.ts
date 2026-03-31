import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { EnvConstants } from 'Common/constants/EnvConstants';
import { GraphErrorException } from 'Common/errors/GraphqlErrorException';

import { EnvironmentService } from 'Environment/environment.service';
import { IStrapiTemplate, ITemplateStrapiFile } from 'FormTemplates/interfaces/formTemplates.interface';
import { LoggerService } from 'Logger/Logger.service';

@Injectable()
export class FormTemplatesService {
  private formTemplatesInstance: AxiosInstance;

  constructor(
    private readonly environemntService: EnvironmentService,
    private readonly loggerService: LoggerService,
  ) {
    this.formTemplatesInstance = axios.create({
      baseURL: `${this.environemntService.getByKey(EnvConstants.FORM_TEMPLATES_BASE_URL)}/api`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getFormById(id: string, formStrapiParams?: Record<string, string>): Promise<IStrapiTemplate> {
    try {
      const queryParams = new URLSearchParams();

      if (formStrapiParams) {
        Object.entries(formStrapiParams)
          .filter(([, value]) => value)
          .forEach(([key, value]) => queryParams.append(key, value));
      }

      const queryString = queryParams.toString();
      const baseUrl = `/templates/internal/id/${id}`;
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;
      this.loggerService.info({ context: 'getFormFromStrapi_url', extraInfo: { url } });
      const response = await this.formTemplatesInstance.get<{template: IStrapiTemplate}>(url);
      this.loggerService.info({ context: 'getFormFromStrapi', extraInfo: { response: response.data } });
      return response.data.template;
    } catch (error) {
      this.loggerService.error({ context: 'getFormFromStrapi', error, extraInfo: { id } });
      return null;
    }
  }

  async getTemplatePdfFileById(id: string): Promise<ITemplateStrapiFile> {
    const templateData = await this.getFormById(id);
    if (!templateData) {
      throw GraphErrorException.NotFound('Template not found');
    }

    return {
      ...templateData.file,
      templateName: templateData.title,
    };
  }
}
