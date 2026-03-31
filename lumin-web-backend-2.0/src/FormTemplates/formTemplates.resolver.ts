import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { RateLimiterStrategy } from 'Common/constants/RateLimiterConstants';
import { SanitizeInputInterceptor } from 'Common/interceptors/sanitize.input.interceptor';

import { GetPDFFormTemplateInput, GetPDFFormTemplatePayload } from 'graphql.schema';
import { AcceptanceRateLimiter } from 'RateLimiter/decorators/rateLimiter.strategy.decorator';
import { RateLimiterGuard } from 'RateLimiter/guards/rateLimiter.guard';

import { FormTemplatesService } from './formTemplates.service';

@UseInterceptors(SanitizeInputInterceptor)
@Resolver('FormTemplates')
export class FormTemplatesResolver {
  constructor(
    private readonly formTemplatesService: FormTemplatesService,
  ) {}

  @UseGuards(RateLimiterGuard)
  @AcceptanceRateLimiter(RateLimiterStrategy.IP_ADDRESS)
  @Query('getPDFFormTemplate')
  getPDFFormTemplate(
    @Args('input') input: GetPDFFormTemplateInput,
  ): Promise<GetPDFFormTemplatePayload> {
    const { templateId } = input;
    return this.formTemplatesService.getTemplatePdfFileById(templateId);
  }
}
