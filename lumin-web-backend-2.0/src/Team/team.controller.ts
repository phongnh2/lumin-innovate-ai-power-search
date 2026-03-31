import {
  Controller,
  UseGuards,
} from '@nestjs/common';

import { RestAuthGuard } from 'Auth/guards/rest.auth.guard';

@UseGuards(RestAuthGuard)
@Controller('teams')
export class TeamController {
  constructor() {
    // empty constructor
  }
}
