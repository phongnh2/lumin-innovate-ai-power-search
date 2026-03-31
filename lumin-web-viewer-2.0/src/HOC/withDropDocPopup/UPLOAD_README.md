# Upload System Documentation

Welcome to the Lumin Upload System documentation! This guide will help you understand and work with the upload functionality in the Lumin web viewer.

## 📚 Documentation Index

### 1. **[Upload Quick Reference](./UPLOAD_QUICK_REFERENCE.md)** - Cheat Sheet
   - Quick start examples
   - Common use cases
   - Available HOCs and props
   - Redux selectors
   - Code snippets
   - **Best for**: Daily development, quick answers, copy-paste examples

### 2. **[Upload Flow Diagrams](./UPLOAD_FLOW_DIAGRAM.md)** - Visual Guide
   - Component composition flow
   - Complete upload flow (step-by-step)
   - Handler registration flow
   - Queue processing
   - Error handling
   - Drag & drop flow
   - useUploadLogic hook details
   - **Best for**: Understanding flow, debugging, visual learners

---

## 🚀 Quick Start

### For Document Upload

```javascript
import withDropDocumentPopup from 'HOC/withDropDocPopup';

const MyDocumentPage = ({ onUpload, canUpload }) => {
  const handleUpload = (files) => {
    onUpload(files, { uploadFrom: 'my_page' });
  };

  return (
    <div>
      <UploadButton 
        onFilesPicked={handleUpload} 
        disabled={!canUpload} 
      />
    </div>
  );
};

export default withDropDocumentPopup(MyDocumentPage);
```

### For Template Upload

```javascript
import { withUploadTemplatesProvider } from 'HOC/withDropDocPopup';

const MyTemplatePage = ({ onUpload, canUpload }) => {
  const handleUpload = (files) => {
    onUpload(files, { uploadFrom: 'templates_page' });
  };

  return (
    <div>
      <UploadButton 
        onFilesPicked={handleUpload} 
        disabled={!canUpload} 
      />
    </div>
  );
};

export default withUploadTemplatesProvider(MyTemplatePage);
```

---

## 🏗️ System Overview

### Architecture Layers

```
┌─────────────────────────────────────────┐
│     User Interface Layer                │
│  (Buttons, Drop Zones, Drag & Drop)     │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Provider Layer (HOC)                │
│  (Context, Drag & Drop State)           │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Handler Layer (HOC)                 │
│  (Queue Management, Sequencing)         │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Container Layer (HOC)               │
│  (Upload Logic, File Handling)          │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│     Service Layer                       │
│  (S3 Upload, API Calls, Redux)          │
└─────────────────────────────────────────┘
```

### Key Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `withDropDocPopupProvider` | Provides drag & drop context | `src/HOC/withDropDocPopup/` |
| `withUploadHandler` | Manages upload queue | `src/HOC/withUploadHandler.js` |
| `withUploadContainer` | Document upload logic | `src/HOC/withUploadContainer.js` |
| `withUploadTemplatesContainer` | Template upload logic | `src/features/UploadTemplate/HOC/` |
| `UploadHandler` | Core document upload | `src/lumin-components/UploadHandler/` |
| `UploadContainer` | File preparation | `src/lumin-components/UploadHandler/` |
| `uploadServices` | Handler registration | `src/services/uploadServices.js` |

---

## 🎯 Common Tasks

### Add Upload to a New Page

1. Import the appropriate HOC
2. Wrap your component
3. Use the provided `onUpload` and `canUpload` props

**Example**:
```javascript
import withDropDocumentPopup from 'HOC/withDropDocPopup';

const NewPage = ({ onUpload, canUpload }) => (
  <button onClick={() => onUpload([file])} disabled={!canUpload}>
    Upload
  </button>
);

export default withDropDocumentPopup(NewPage);
```

### Track Upload Progress

```javascript
import { useSelector } from 'react-redux';
import selectors from 'selectors';

const ProgressTracker = ({ fileId }) => {
  const fileUpload = useSelector(state => 
    selectors.getUploadingDocumentByGroupId(state, fileId)
  );

  return (
    <div>
      <progress value={fileUpload?.progress || 0} max={100} />
      <span>{fileUpload?.status}</span>
    </div>
  );
};
```

### Cancel an Upload

```javascript
const CancelButton = ({ fileId }) => {
  const fileUpload = useSelector(state => 
    selectors.getUploadingDocumentByGroupId(state, fileId)
  );

  const handleCancel = () => {
    fileUpload?.cancelToken?.cancel('User cancelled');
  };

  return <button onClick={handleCancel}>Cancel</button>;
};
```

### Handle Drag & Drop

```javascript
import { useContext } from 'react';
import { DropDocumentPopupContext } from 'HOC/withDropDocPopup/withDropDocPopupProvider';

const DropZone = () => {
  const { onUpload, setName } = useContext(DropDocumentPopupContext);

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onUpload(files, { uploadFrom: 'drop_zone' });
    setName(null);
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      Drop files here
    </div>
  );
};
```

---

## 📖 Key Concepts

### HOC Composition

Upload functionality uses composed Higher-Order Components:

```javascript
const withDropDocumentPopup = compose(
  withUploadContainer,           // Provides upload logic
  withUploadHandler,             // Manages queue
  withDropDocPopupProvider,      // Provides context
)(Component);
```

**Execution Order**: Bottom to top (Provider → Handler → Container)  
**Props Flow**: Top to bottom (Container → Handler → Provider → Component)

### Handler Registration

Handlers are registered dynamically when components mount:

```javascript
// Registration (on mount)
uploadServices.registerHandler(
  'upload_document_handler',
  handleUploadProgress
);

// Retrieval (during upload)
const handler = uploadServices.getUploadHandler(
  fileUpload.handlerName
);

// Cleanup (on unmount)
uploadServices.removeHandler('upload_document_handler');
```

### Upload Queue

Files are processed sequentially to:
- Prevent network congestion
- Provide better UX with progress tracking
- Simplify error handling
- Reduce server load

### Context API

`DropDocumentPopupContext` provides:
- `onUpload` - Upload function
- `canUpload` - Permission check
- `name` - Drop destination name
- `folderDraggingOver` - Current folder being dragged over
- Setters for drag & drop state

---

## 📊 Metrics & Monitoring

### Track Upload Events

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

### Monitor Upload Performance

Key metrics to track:
- Average upload time per file size
- Success/failure rate
- Common error types
- Network timeout frequency
- Retry success rate

---

## 🔧 Configuration

### File Size Limits

```javascript
import { MAXIMUM_FILE_SIZE, MAX_DOCUMENT_SIZE } from 'constants/lumin-common';

// Free users
MAXIMUM_FILE_SIZE.FREE_PLAN

// Premium users
MAXIMUM_FILE_SIZE.PREMIUM_PLAN

// Absolute maximum
MAX_DOCUMENT_SIZE
```

### Upload Destinations

```javascript
import { folderType } from 'constants/documentConstants';

folderType.DEVICE           // Local device
folderType.INDIVIDUAL       // Personal cloud
folderType.ORGANIZATION     // Organization
folderType.TEAMS            // Team folder
```

### Handler Names

```javascript
import { uploadServices } from 'services';

uploadServices.DOCUMENT_HANDLER   // 'upload_document_handler'
uploadServices.TEMPLATE_HANDLER   // 'upload_template_handler'
```

---

## 🚦 Status & States

### Upload Status

```javascript
import { UploadUtils } from 'utils';

UploadUtils.UploadStatus.PENDING     // Queued
UploadUtils.UploadStatus.UPLOADING   // In progress
UploadUtils.UploadStatus.COMPLETED   // Success
UploadUtils.UploadStatus.ERROR       // Failed
```

### File Upload Object Structure

```typescript
{
  groupId: string,              // Unique identifier
  fileName: string,             // Original filename
  file: File,                   // File object
  thumbnail: File,              // Thumbnail file
  progress: number,             // 0-100
  status: UploadStatus,         // Current status
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

## 🔗 Related Resources

### Internal Documentation
- [Contributing Guidelines](../../../CONTRIBUTING.md)
- [README](../../../README.md)
- [Architecture Overview](../../../architecture.png)

### External Resources
- [React HOC Documentation](https://reactjs.org/docs/higher-order-components.html)
- [Redux Documentation](https://redux.js.org/)
- [Axios Documentation](https://axios-http.com/)

### Code References
- Redux Actions: `src/actions/`
- Redux Selectors: `src/selectors/`
- Constants: `src/constants/`
- Utils: `src/utils/`

---

## 💡 Tips & Best Practices

### ✅ Do's

- **Use provided HOCs** for standard upload functionality
- **Check `canUpload`** before allowing file selection
- **Track upload progress** for better UX
- **Handle errors gracefully** with user-friendly messages
- **Clean up** cancel tokens and object URLs
- **Use context** for drag & drop state
- **Batch Redux updates** when possible

### ❌ Don'ts

- **Don't create custom upload logic** unless necessary
- **Don't use spread parameters** in HOC definitions
- **Don't skip error handling**
- **Don't forget to cancel** in-flight requests on unmount
- **Don't block the UI** during long uploads
- **Don't hardcode** handler names or constants

---

## 🆘 Getting Help

### Documentation Priority
1. Check **Quick Reference** for common tasks
2. Review **Flow Diagrams** to understand the flow
3. Search the codebase for examples
4. Check Redux DevTools for state issues and debug upload flow
5. Review network tab for GraphQL mutations and S3 errors

### Common Questions

**Q: How do I add upload to my page?**  
A: See "Quick Start" section above

**Q: How do I track upload progress?**  
A: Use Redux selectors (see "Track Upload Progress" section)

**Q: Why is my upload not starting?**  
A: Check Redux DevTools for state updates and verify HOC composition is correct

**Q: How do I create a new upload type?**  
A: See Flow Diagrams → "useUploadLogic Hook Details" and review the hook-based architecture

**Q: What's the difference between document and template upload?**  
A: See Flow Diagrams → "Template Upload Flow"

---

## 📅 Changelog

### Version 2.1 (Current)
- ✨ Refactored upload logic into `useUploadLogic` hook
- ✨ Centralized upload functions for better code reusability
- ✨ Improved maintainability and testability
- 📚 Updated documentation to reflect hook-based architecture

### Version 2.0
- ✨ Refactored HOC composition for code reusability
- ✨ Added `withDropDocPopupProvider` as reusable provider
- ✨ Implemented handler registration pattern
- ✨ Separated document and template upload logic
- 📚 Added comprehensive documentation

### Version 1.0
- Initial implementation
- Basic upload functionality
- Redux integration

---

## 👥 Maintainers

**Lumin Frontend Team**

For questions or contributions:
1. Review this documentation
2. Check existing code patterns
3. Follow best practices
4. Submit PR with tests

---

## 📝 License

See [LICENSE](../../../LICENSE) file for details.

---

**Last Updated**: November 19, 2025  
**Documentation Version**: 2.1

---

## Quick Navigation

- **Just starting?** → [Quick Reference](./UPLOAD_QUICK_REFERENCE.md)
- **Need visual understanding?** → [Flow Diagrams](./UPLOAD_FLOW_DIAGRAM.md)
- **Having issues?** → Check Redux DevTools and review the Flow Diagrams

**Happy Coding! 🚀**

