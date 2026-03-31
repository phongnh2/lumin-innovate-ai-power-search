# Swagger Documentation Guide

This guide explains how to use Swagger API documentation in the Lumin Auth application.

## Accessing the Swagger UI

The Swagger UI is available at `/swagger/ui` in development mode only. This page displays all documented API endpoints with their request/response schemas.

> **Note**: For security reasons, the Swagger UI is not accessible in production environments.

## Documentation Approaches

### Option 1: Inline Documentation

Add JSDoc comments with `@swagger` tag directly above your API handlers:

```typescript
/**
 * @swagger
 * /api/example:
 *   get:
 *     summary: Short description
 *     tags:
 *       - Category
 *     responses:
 *       200:
 *         description: Success response
 */
export default function handler(req, res) {
  // Your handler code
}
```

### Option 2: Separated Documentation (Recommended)

Instead of defining API documentation within TypeScript files, you can maintain separate YAML files for easier management and modification. This approach is ideal for structured documentation without cluttering code.

1. **Paths Documentation**: Define API endpoints in YAML files under `docs/swagger/paths/`.
2. **Schemas Documentation**: Define request/response data models in YAML files under `docs/swagger/schemas/`.
3. **Swagger Configuration**: The `swagger.ts` file loads these YAML files automatically, combining them into a single OpenAPI specification.

Example structure:
```
docs/swagger/
  ├── paths/
  │   ├── oauth2-path.yaml
  │   ├── user-path.yaml
  ├── schemas/
  │   ├── oauth2-schema.yaml
  │   ├── user-schema.yaml
```

Example `paths` YAML file (`oauth2-path.yaml`):

```yaml
/oauth2/consent:
  post:
    tags:
      - OAuth2
    summary: Handle OAuth2 consent requests
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/OAuth2ConsentRequest'
    responses:
      '308':
        description: Redirect based on consent decision
        headers:
          Location:
            schema:
              type: string
            description: URL to redirect to
```

This method ensures API documentation is structured and version-controlled separately from the implementation.

## Common Documentation Elements

### Schemas

Define data models in your documentation:

```yaml
components:
  schemas:
    UserResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
```

### Endpoints

Document API endpoints with their HTTP methods:

```yaml
/api/user:
  get:
    summary: Get current user
    tags:
      - User
    security:
      - BearerAuth: []
    responses:
      200:
        description: Current user information
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserResponse'
```

### Request Bodies

For endpoints that accept data:

```yaml
/api/user/change-name:
  patch:
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ChangeNameDTO'
```

## Configuration

The Swagger configuration is in `lib/swagger.ts`. It includes:

- API information (title, version)
- Security schemes
- Reusable schemas
- Folders to scan for documentation

The `schemaFolders` option includes both `interfaces` and `docs/swagger` directories.

## Best Practices

1. Group related endpoints with the same tag
2. Document all possible response codes
3. Include examples for complex data structures
4. Keep documentation updated when changing APIs
