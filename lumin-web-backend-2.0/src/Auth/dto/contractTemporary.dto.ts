// TODO: add validation
import { ApiProperty } from '@nestjs/swagger';

export class ContractTemporaryDto {
  @ApiProperty({
    description: 'Contract information to be stored temporarily',
    type: 'object',
    additionalProperties: true,
  })
    contractInfo: Record<string, any>;
}
