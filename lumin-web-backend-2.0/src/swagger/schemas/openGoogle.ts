import { ApiResponseOptions } from '@nestjs/swagger';

export const GoogleHeaderSchema: ApiResponseOptions['headers'] = {
  Location: {
    description: 'Redirect URL',
    schema: {
      type: 'string',
    },
  },
  'Set-Cookie': {
    description: 'Session cookies for the Google flow',
    schema: {
      type: 'string',
    },
  },
};
