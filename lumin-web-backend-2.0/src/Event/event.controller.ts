/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  Controller, Get, Req, Res, UseGuards, UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

import { ValidationPipeRest } from 'Common/validator/validator.pipe';

import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';
import { PersonalEventService } from 'Event/services/personal.event.service';
import { LoggerService } from 'Logger/Logger.service';

@UseGuards(RestAuthGuard)
@Controller('events')
export class EventController {
  constructor(
    private readonly personalEventService: PersonalEventService,
    private readonly loggerService: LoggerService,
  ) {}

  @ApiOperation({
    summary: 'Export personal data',
    description: 'Exports all personal data for the authenticated user as a ZIP file download',
  })
  @ApiResponse({
    status: 206,
    description: 'Partial Content - ZIP file stream started',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
          description: 'ZIP file containing all personal data',
        },
      },
    },
  })
  @Get('export-personal-data')
  @UsePipes(new ValidationPipeRest())
  async exportPersonalData(@Req() request, @Res() response) {
    const startTime = process.hrtime();
    const { user } = request;
    const stream = await this.personalEventService.exportDataToStream(user._id as string);

    response.status(206);
    response.setHeader('Accept-Ranges', 'bytes');
    response.setHeader('Access-Control-Max-Age', 3000);
    response.setHeader('Access-Control-Expose-Headers', 'Accept-Ranges, Content-Length , Content-Range, Content-Type');
    response.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
    response.setHeader('Content-Type', 'application/zip');
    response.setHeader('Content-disposition', 'attachment; filename=myFile.zip');

    const processTime = process.hrtime(startTime);
    const ms = processTime[0] * 1e3 + processTime[1] * 1e-6;
    this.loggerService.info({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...this.loggerService.getCommonAttributes(request),
      context: request.url,
      extraInfo: {
        processTime: ms.toFixed(3),
      },
    });
    stream.pipe(response);
  }
}
