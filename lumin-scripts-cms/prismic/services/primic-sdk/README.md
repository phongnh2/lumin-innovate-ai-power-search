# Prismic Service

Service for managing Prismic CMS documents, including export, URL processing, and bulk updates.

## Structure

- `prismic.service.ts` - Main service class with business logic
- `prismic.interface.ts` - TypeScript interfaces and types
- `prismic.constants.ts` - Configuration constants and patterns

## Features

### 1. Export Documents by Custom Type

Export all documents from Prismic organized by custom type:

```bash
deno task prismic exportDocuments
```

**Output**: `prismic/data/export/documents-by-custom-types/{customType}/`

### 2. Process Exported Documents

Find and replace URLs in exported documents (e.g., adding `?from=website` parameter):

```bash
deno task prismic processExportedDocuments
```

**Input**: `prismic/data/export/documents-by-custom-types/`
**Output**: `prismic/data/export/found/`

### 3. Update Documents from Folder

Update specific documents back to Prismic from a folder:

```bash
deno task prismic updateDocumentsFromFolder
```

**Input**: `prismic/data/export/found/`
**Output**:

- Success: `prismic/data/export/output/success/`
- Failed: `prismic/data/export/output/fail/`

### 4. Update All Documents

Bulk update all documents from all subfolders:

```bash
deno task prismic updateAllDocuments
```

### 5. Full Workflow

Run the complete workflow (export → process → update):

```bash
deno task prismic runFullWorkflow
```

⚠️ **Note**: Document update step is commented out by default for safety. Uncomment in the service to enable.

## Configuration

Update constants in `prismic.constants.ts`:

```typescript
export const PRISMIC_AUTH = {
  REPO: "lumindev",
  EMAIL: Deno.env.get("PRISMIC_EMAIL") || "",
  PASSWORD: Deno.env.get("PRISMIC_PASSWORD") || "",
  TOKEN: Deno.env.get("PRISMIC_TOKEN") || "",
};

export const URL_PATTERNS = {
  SIGN_IN: /https:\/\/account\.luminpdf\.com\/sign-in\/?(?:\?[^"\s]*)?/gi,
};
```

## Environment Variables

Add to your `.env` file:

```env
PRISMIC_EMAIL=your-email@example.com
PRISMIC_PASSWORD=your-password
PRISMIC_TOKEN=your-prismic-token
```

## Custom Types

Update custom types in `prismic/main.ts`:

```typescript
exportDocuments: () => prismicService.exportDocumentsByCustomType(["page", "blog_post", "article"]),
```

## Data Structure

```
prismic/data/
├── export/
│   ├── documents-by-custom-types/
│   │   ├── page/
│   │   │   └── page_abc123_home.json
│   │   └── blog_post/
│   │       └── blog_post_xyz789_my-post.json
│   ├── found/
│   │   ├── page/
│   │   └── blog_post/
│   └── output/
│       ├── success/
│       └── fail/
```

## Safety Features

- Separate folders for success/fail during updates
- Document update step commented out by default
- Detailed logging with emoji indicators
- Error tracking and reporting
- Authentication token management

## Logging Convention

- 🚀 - Starting operations
- ✅ - Successful completion
- ❌ - Errors and failures
- 📊 - Statistics and counts
- 📈 - Progress updates
- 📁 - Directory operations
- 📝 - Step indicators
