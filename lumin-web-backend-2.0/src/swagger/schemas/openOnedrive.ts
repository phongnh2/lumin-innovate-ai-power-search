import { ApiResponseOptions } from '@nestjs/swagger';

export const OneDriveHeaderSchema: ApiResponseOptions['headers'] = {
  Location: {
    description: 'Redirect URL',
    schema: {
      type: 'string',
    },
  },
  'Set-Cookie': {
    description: 'Session cookies for the OneDrive flow',
    schema: {
      type: 'string',
    },
  },
};
