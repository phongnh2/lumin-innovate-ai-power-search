# Upload System - Quick Reference

## Quick Start

### Add Upload to a Page

```javascript
import { compose } from 'redux';
import withDropDocumentPopup from 'HOC/withDropDocPopup';

const MyPage = ({ onUpload, canUpload }) => {
  return (
    <UploadButton 
      onFilesPicked={(files) => onUpload(files, { uploadFrom: 'my_page' })} 
      disabled={!canUpload} 
    />
  );
};

export default withDropDocumentPopup(MyPage);
```

### Add Template Upload to a Page

```javascript
import { withUploadTemplatesProvider } from 'HOC/withDropDocPopup';

const TemplatesPage = ({ onUpload, canUpload }) => {
  return (
    <UploadButton 
      onFilesPicked={(files) => onUpload(files, { uploadFrom: 'templates_page' })} 
      disabled={!canUpload} 
    />
  );
};

export default withUploadTemplatesProvider(TemplatesPage);
```

---

## Available HOCs

| HOC | Use Case | Handler Type |
|-----|----------|--------------|
| `withDropDocumentPopup` | Document upload | `upload_document_handler` |
| `withUploadTemplatesProvider` | Template upload | `upload_template_handler` |

---

## Props Provided by HOCs

All upload HOCs provide these props:

```typescript
{
  onUpload: (files: File[], options?: UploadOptions) => Promise<void>,
  canUpload: boolean,
  handleUploadProgress: (fileUpload: FileUpload) => Promise<Document | null>
}
```

### `onUpload` Options

```typescript
{
  uploadFrom?: string,           // Analytics source tracking
  folderId?: string,             // Destination folder ID
  folder?: {                     // Folder details
    type: 'INDIVIDUAL' | 'ORGANIZATION' | 'TEAMS',
    entityId: string,
    folderId: string
  }
}
```

---

## Common Use Cases

### 1. Simple Upload Button

```javascript
const MyComponent = ({ onUpload, canUpload }) => (
  <button onClick={() => onUpload([file])} disabled={!canUpload}>
    Upload
  </button>
);
```

### 2. Drag & Drop Zone

```javascript
import { useContext } from 'react';
import { DropDocumentPopupContext } from 'HOC/withDropDocPopup/withDropDocPopupProvider';

const DropZone = ({ onUpload }) => {
  const { setName } = useContext(DropDocumentPopupContext);
  
  const handleDrop = (e) => {
    const files = Array.from(e.dataTransfer.files);
    onUpload(files, { uploadFrom: 'drag_drop' });
    setName(null);
  };
  
  return <div onDrop={handleDrop}>Drop here</div>;
};
```

### 3. Upload to Specific Folder

```javascript
const handleUploadToFolder = (files, folderId) => {
  onUpload(files, {
    folderId,
    uploadFrom: 'folder_view',
  });
};
```

### 4. File Input

```javascript
<input
  type="file"
  multiple
  onChange={(e) => onUpload(Array.from(e.target.files))}
/>
```

---

## Context API

### DropDocumentPopupContext

Access drag & drop state:

```javascript
import { useContext } from 'react';
import { DropDocumentPopupContext } from 'HOC/withDropDocPopup/withDropDocPopupProvider';

const MyComponent = () => {
  const {
    name,                      // Current drop destination name
    setName,                   // Set drop destination
    folderDraggingOver,        // Folder being dragged over
    setFolderDraggingOver,     // Set folder dragging state
    onUpload,                  // Upload function
    canUpload,                 // Upload permission
  } = useContext(DropDocumentPopupContext);
  
  return <div>{name}</div>;
};
```

---

## Upload Status Tracking

### Redux Selectors

```javascript
import selectors from 'selectors';
import { useSelector } from 'react-redux';

// Get all uploading files
const uploadingFiles = useSelector(selectors.getUploadingDocuments);

// Get specific file
const fileUpload = useSelector(state => 
  selectors.getUploadingDocumentByGroupId(state, fileId)
);

// Check if valid for upload
const isValid = useSelector(state => 
  selectors.isValidForUpload(state)(fileId)
);
```

### File Upload Object

```typescript
{
  groupId: string,              // Unique identifier
  fileName: string,             // Original filename
  file: File,                   // File object
  thumbnail: File,              // Thumbnail file
  progress: number,             // 0-100
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ERROR',
  handlerName: string,          // Handler identifier
  folder: {
    type: FolderType,
    entityId: string,
    folderId: string
  },
  cancelToken: CancelToken,     // For cancellation
  error: string | null,         // Error message
  document: Document | null,    // Result after upload
}
```

---

## Handler Names (Constants)

```javascript
import { uploadServices } from 'services';

uploadServices.DOCUMENT_HANDLER   // 'upload_document_handler'
uploadServices.TEMPLATE_HANDLER   // 'upload_template_handler'
```

---

## Upload Services API

### Register Handler

```javascript
import { uploadServices } from 'services';

uploadServices.registerHandler(
  'my_custom_handler',
  handleUploadProgressFunction
);
```

### Get Handler

```javascript
const handler = uploadServices.getUploadHandler('my_custom_handler');
```

### Remove Handler

```javascript
uploadServices.removeHandler('my_custom_handler');
```

---

## Composition Pattern

### HOC Structure

```
withUploadContainer
  ↓ provides: onUpload, handleUploadProgress, canUpload, handlerName
withUploadHandler
  ↓ manages: upload queue, sequencing, retry logic
withDropDocPopupProvider
  ↓ provides: context for drag & drop
YourComponent
```

### Custom Composition

```javascript
import { compose } from 'redux';
import withUploadContainer from 'HOC/withUploadContainer';
import withUploadHandler from 'HOC/withUploadHandler';
import { withDropDocPopupProvider } from 'HOC/withDropDocPopup/withDropDocPopupProvider';

const withMyCustomUpload = (Component) =>
  compose(
    withUploadContainer,        // Top layer
    withUploadHandler,          // Middle layer
    withDropDocPopupProvider,   // Bottom layer
  )(Component);
```

---

## Common Code Snippets

### Check Upload Permission

```javascript
const canUploadDocuments = [
  folderType.DEVICE,
  folderType.INDIVIDUAL,
  folderType.ORGANIZATION,
  folderType.TEAMS,
].includes(currentFolderType);
```

### Cancel Upload

```javascript
// From Redux state
const fileUpload = useSelector(state => 
  selectors.getUploadingDocumentByGroupId(state, fileId)
);

// Cancel it
fileUpload?.cancelToken?.cancel('User cancelled');
```

### Show Upload Progress

```javascript
const ProgressDisplay = ({ fileId }) => {
  const file = useSelector(state => 
    selectors.getUploadingDocumentByGroupId(state, fileId)
  );
  
  if (!file) return null;
  
  return (
    <div>
      <div>{file.fileName}</div>
      <progress value={file.progress} max={100} />
      <div>{file.status}</div>
    </div>
  );
};
```

### File Validation

```javascript
import { validator } from 'utils';

// Check file type
const isValidType = validator.isValidFileType(file.type);

// Check file size
const { allowedUpload, maxSizeAllow } = uploadServices.checkUploadBySize(
  file.size,
  isPremiumUser
);
```

---

## Folder Types

```javascript
import { folderType } from 'constants/documentConstants';

folderType.DEVICE           // Local device storage
folderType.INDIVIDUAL       // Personal cloud storage
folderType.ORGANIZATION     // Organization folder
folderType.TEAMS            // Team folder
```

---

## Upload Status Constants

```javascript
import { UploadUtils } from 'utils';

UploadUtils.UploadStatus.PENDING     // Waiting to upload
UploadUtils.UploadStatus.UPLOADING   // Currently uploading
UploadUtils.UploadStatus.COMPLETED   // Successfully uploaded
UploadUtils.UploadStatus.ERROR       // Upload failed
```

---

## Error Handling

### Display Error Toast

```javascript
import { toastUtils } from 'utils';
import { ModalTypes } from 'constants/lumin-common';

toastUtils.openToast({
  message: 'Upload failed',
  type: ModalTypes.ERROR,
});
```

### Get Error Message

```javascript
import ErrorMessageUtils from 'lumin-components/UploadHandler/utils/getErrorUploadMessage';

const errorMessage = ErrorMessageUtils.getErrorUploadMessage(error);
```

---

## Event Tracking

### Track Upload Event

```javascript
import { eventTracking } from 'utils';
import UserEventConstants from 'constants/eventConstants';

// Document upload
eventTracking(UserEventConstants.EventType.UPLOAD_DOCUMENT, {
  LuminFileId: document._id,
  fileName: document.name,
  source: 'my_page',
});

// Template upload
eventTracking(UserEventConstants.EventType.UPLOAD_TEMPLATE, {
  LuminTemplateId: template._id,
  templateName: template.name,
  source: 'templates_page',
});
```

---

## File Size Limits

```javascript
import { MAXIMUM_FILE_SIZE, MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

// Maximum sizes (in MB)
MAXIMUM_FILE_SIZE.FREE_PLAN      // Free plan limit
MAXIMUM_FILE_SIZE.PREMIUM_PLAN   // Premium plan limit
MAX_DOCUMENT_SIZE                // Absolute maximum
```

---

## Useful Console Commands

### Debug Upload State

```javascript
// In browser console
JSON.stringify(
  window.reduxStore.getState().uploading,
  null,
  2
)
```

### Get Upload Handler

```javascript
// In browser console
window.uploadServices.getUploadHandler('upload_document_handler')
```

---

## Component Dependencies

```
UploadButton
  ├── withDropDocPopup.Consumer
  ├── UploadDropZonePopper
  └── EnhancedUploadButton

withDropDocumentPopup
  ├── withUploadContainer
  │   └── UploadHandler
  │       └── UploadContainer
  ├── withUploadHandler
  └── withDropDocPopupProvider

withUploadTemplatesProvider
  ├── withUploadTemplatesContainer
  │   └── UploadContainer
  ├── withUploadHandler
  └── withDropDocPopupProvider
```

---

## Related Documentation

- Upload Flow Diagrams: [UPLOAD_FLOW_DIAGRAM.md](./UPLOAD_FLOW_DIAGRAM.md)
- Main Upload README: [UPLOAD_README.md](./UPLOAD_README.md)
- Redux Patterns: See Redux documentation
- HOC Patterns: See React HOC documentation
- useUploadLogic Hook: `src/lumin-components/UploadHandler/hooks/useUploadLogic.js`

---

**Quick Tip**: When in doubt, use `withDropDocumentPopup` for documents and `withUploadTemplatesProvider` for templates.

