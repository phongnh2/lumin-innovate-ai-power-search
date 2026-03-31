import { load } from 'js-yaml';

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const apiVersion = '1.0.0';
const title = 'Lumin Auth API Documentation';
const description = 'API documentation for Lumin Auth service';

const loadYamlConfig = (filePath: string) => {
  const basePath = process.cwd();
  const yamlContent = readFileSync(join(basePath, filePath), 'utf8');
  return load(yamlContent);
};

const loadPaths = () => {
  const basePath = process.cwd();
  const swaggerDir = join(basePath, 'docs/swagger/paths');

  return readdirSync(swaggerDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => loadYamlConfig(`docs/swagger/paths/${file}`));
};

const loadSchemas = () => {
  const basePath = process.cwd();
  const swaggerDir = join(basePath, 'docs/swagger/schemas');

  return readdirSync(swaggerDir)
    .filter(file => file.endsWith('.yaml'))
    .map(file => loadYamlConfig(`docs/swagger/schemas/${file}`));
};

export const getSwaggerSpec = () => {
  const paths = loadPaths();
  const schemas = loadSchemas();

  return {
    openapi: '3.0.0',
    info: {
      title,
      version: apiVersion,
      description
    },
    servers: [
      {
        url: '/api',
        description: 'API server'
      }
    ],
    components: {
      schemas: Object.assign({}, ...schemas),
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        KratosHookAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'authorization',
          description: 'API key required for Kratos hook endpoints'
        },
        MobileAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      parameters: {
        RefreshTokenHeader: {
          name: 'refreshtoken',
          in: 'header',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Bearer token for refresh authentication',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        MobileHeader: {
          name: 'x-mobile',
          in: 'header',
          required: true,
          schema: {
            type: 'string'
          },
          description: 'Header to identify requests from mobile applications'
        }
      }
    },
    paths: Object.assign({}, ...paths),
    apiFolder: 'pages/api',
    schemaFolders: ['interfaces', 'docs/swagger']
  };
};
