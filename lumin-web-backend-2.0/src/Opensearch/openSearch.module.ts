import { Module } from '@nestjs/common';

import { OpenSearchSerivce } from './openSearch.service';

@Module({
  imports: [],
  providers: [
    OpenSearchSerivce,
  ],
  exports: [
    OpenSearchSerivce,
  ],
})
export class OpenSearchModule {}
