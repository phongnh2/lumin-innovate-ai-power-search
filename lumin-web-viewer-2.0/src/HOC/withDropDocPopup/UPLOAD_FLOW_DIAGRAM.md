# Upload System - Flow Diagrams

## Table of Contents
1. [Component Composition Flow](#component-composition-flow)
2. [Document Upload Flow](#document-upload-flow)
3. [Template Upload Flow](#template-upload-flow)
4. [Handler Registration Flow](#handler-registration-flow)
5. [Upload Queue Processing](#upload-queue-processing)
6. [Error Handling Flow](#error-handling-flow)
7. [Drag & Drop Flow](#drag--drop-flow)

---

## Component Composition Flow

### Document Upload Composition

```
withDropDocumentPopup(Component)
     │
     ├──> compose(
     │      withUploadContainer,
     │      withUploadHandler,
     │      withDropDocPopupProvider
     │    )(Component)
     │
     ▼
┌────────────────────────────────────────┐
│     withUploadContainer                │
│  ┌──────────────────────────────────┐  │
│  │  <UploadHandler>                 │  │
│  │    {({ upload, progress }) =>    │  │
│  │      <NextLayer                  │  │
│  │        onUpload={upload}         │  │
│  │        handleUploadProgress={..} │  │
│  │        handlerName="upload_..."  │  │
│  │        canUpload={true}          │  │
│  │      />                          │  │
│  │    }                             │  │
│  │  </UploadHandler>                │  │
│  └──────────────────────────────────┘  │
└────────────────┬───────────────────────┘
                 │ Props Flow Down
                 ▼
┌────────────────────────────────────────┐
│     withUploadHandler (Class)          │
│  ┌──────────────────────────────────┐  │
│  │ constructor() {                  │  │
│  │   uploadServices.registerHandler │  │
│  │ }                                │  │
│  │                                  │  │
│  │ componentDidUpdate() {           │  │
│  │   if (newFiles) {                │  │
│  │     uploadFileSequence()         │  │
│  │   }                              │  │
│  │ }                                │  │
│  │                                  │  │
│  │ render() {                       │  │
│  │   return <NextLayer {...props} />│  │
│  │ }                                │  │
│  └──────────────────────────────────┘  │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│   withDropDocPopupProvider             │
│  ┌──────────────────────────────────┐  │
│  │ const [name, setName] = ...      │  │
│  │ const [folder, setFolder] = ...  │  │
│  │                                  │  │
│  │ const contextValue = {           │  │
│  │   name,                          │  │
│  │   setName,                       │  │
│  │   onUpload: props.onUpload,      │  │
│  │   canUpload: props.canUpload     │  │
│  │ }                                │  │
│  │                                  │  │
│  │ return (                         │  │
│  │   <Context.Provider>             │  │
│  │     <Component {...props} />     │  │
│  │     <TopPopup.DropDocument />    │  │
│  │   </Context.Provider>            │  │
│  │ )                                │  │
│  └──────────────────────────────────┘  │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│         Your Component                 │
│                                        │
│  Props received:                       │
│    - onUpload: function                │
│    - canUpload: boolean                │
│    - handleUploadProgress: function    │
│                                        │
│  Context available:                    │
│    - DropDocumentPopupContext          │
└────────────────────────────────────────┘
```

---

## Document Upload Flow

### Step-by-Step Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                             │
│                                                                 │
│  User clicks upload button or drops files                      │
│  ├── <UploadButton onFilesPicked={onUpload} />                 │
│  └── <DropZone onDrop={onUpload} />                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. UPLOAD CONTAINER - Validation & Preparation                 │
│                                                                 │
│  UploadContainer.upload(files, options)                        │
│  ├── Validate file type                                        │
│  ├── Check file size                                           │
│  ├── Check upload permissions                                  │
│  ├── For each file:                                            │
│  │   ├── Generate unique fileId (UUID)                         │
│  │   ├── Linearize PDF (if PDF)                                │
│  │   ├── Generate thumbnail                                    │
│  │   └── Create fileUpload object                              │
│  │       {                                                     │
│  │         groupId: uuid,                                      │
│  │         file: File,                                         │
│  │         thumbnail: File,                                    │
│  │         status: 'PENDING',                                  │
│  │         handlerName: 'upload_document_handler'              │
│  │       }                                                     │
│  └── dispatch(addUploadingFiles(fileUploads))                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. REDUX STATE UPDATE                                           │
│                                                                 │
│  Redux Store: uploading.files = [                              │
│    {                                                            │
│      groupId: 'uuid-1',                                         │
│      fileName: 'document.pdf',                                  │
│      file: File,                                                │
│      thumbnail: File,                                           │
│      progress: 0,                                               │
│      status: 'PENDING',                                         │
│      handlerName: 'upload_document_handler',                    │
│      folder: { type, entityId, folderId }                       │
│    }                                                            │
│  ]                                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. UPLOAD HANDLER - Detect New Files                           │
│                                                                 │
│  withUploadHandler.componentDidUpdate()                        │
│  ├── prevProps.uploadingFiles.length = 0                       │
│  ├── this.props.uploadingFiles.length = 1                      │
│  ├── isFirstTimeUpload = true                                  │
│  └── this.uploadFileSequence(uploadList)                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. UPLOAD QUEUE PROCESSING (Sequential)                        │
│                                                                 │
│  uploadFileSequence(uploadList)                                │
│  for (const fileUpload of uploadList) {                        │
│    const handler = uploadServices.getUploadHandler(            │
│      fileUpload.handlerName                                    │
│    );                                                           │
│    await handler(fileUpload); ◄──── Sequential, one at a time  │
│  }                                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. UPLOAD HANDLER - Process Single File                        │
│                                                                 │
│  UploadContainer.handleUploadProgress(fileUpload)              │
│  ├── Validate file is ready (not COMPLETED/ERROR)              │
│  ├── dispatch(updateUploadingFile({                            │
│  │     groupId,                                                │
│  │     status: 'UPLOADING'                                     │
│  │   }))                                                       │
│  └── await handleBeforeUploadingFile(fileUpload)               │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. useUploadLogic HOOK - Determine Destination & Upload        │
│                                                                 │
│  const { onUploadHOC } = useUploadLogic({ uploadServices })    │
│                                                                 │
│  onUploadHOC(fileData)                                         │
│  ├── Get file upload from Redux by groupId                     │
│  ├── Extract folder info (type, entityId, folderId)            │
│  ├── Determine organization ID based on context                │
│  │   └── getOrgId(clientId)                                    │
│  │       ├── isViewer → currentOrganization._id                │
│  │       ├── isTemplate → clientId                             │
│  │       └── isOrgDocumentTab → clientId : null                │
│  │                                                             │
│  └── switch (folder.type) {                                    │
│      case 'INDIVIDUAL':                                         │
│        return onUpload(data, uploadDocumentToPersonal);        │
│      case 'ORGANIZATION':                                       │
│        return onUpload(data, uploadDocumentToOrganization);    │
│      case 'TEAMS':                                              │
│        return onUpload(data, uploadDocumentToOrgTeam);         │
│    }                                                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. useUploadLogic - onUpload Common Logic                      │
│                                                                 │
│  onUpload(data, uploadFunction)                                │
│  ├── Create cancel token source                                │
│  ├── Compress thumbnail (if exists)                            │
│  │   └── await compressThumbnail(data.thumbnail)               │
│  ├── Execute upload function with compressed data              │
│  │   └── await uploadFunction({ ...data, thumbnail, source })  │
│  ├── Cache document (if enableCaching)                         │
│  │   └── documentCacheBase.add({ key, etag, file })            │
│  └── Track analytics event                                     │
│      ├── isTemplate → UPLOAD_TEMPLATE                          │
│      └── else → UPLOAD_DOCUMENT                                │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. S3 UPLOAD - Get Presigned URLs                              │
│                                                                 │
│  uploadDocumentToPersonal/Organization/OrgTeam()               │
│  ├── const { document, thumbnail, encodedUploadData } =        │
│  │     await getPresignedUrl({                                 │
│  │       documentMimeType: file.type,                          │
│  │       thumbnailMimeType: thumbnail.type                     │
│  │     });                                                     │
│  │                                                             │
│  │   Backend Response:                                         │
│  │   {                                                         │
│  │     document: { url: 's3://...', fields: {...} },          │
│  │     thumbnail: { url: 's3://...', fields: {...} },         │
│  │     encodedUploadData: 'base64...'                          │
│  │   }                                                         │
│  │                                                             │
│  ├── await Promise.all([                                       │
│  │     documentServices.uploadFileToS3(                        │
│  │       { file, presignedUrl: document.url },                 │
│  │       {                                                     │
│  │         cancelToken: source.token,                          │
│  │         onUploadProgress: onUploadProgress(fileId)          │
│  │       }                                                     │
│  │     ),                                                      │
│  │     documentServices.uploadFileToS3({                       │
│  │       file: thumbnail,                                      │
│  │       presignedUrl: thumbnail.url                           │
│  │     })                                                      │
│  │   ]);                                                       │
│  │                                                             │
│  └── return encodedUploadData;                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. CREATE DOCUMENT RECORD & DISPLAY TOAST                     │
│                                                                 │
│  uploadDocumentToPersonal/Organization/OrgTeam()               │
│  ├── GraphQL Mutation:                                         │
│  │   - Personal: uploadDocumentToPersonalV2                    │
│  │   - Organization: uploadDocumentToOrganizationV2            │
│  │   - Team: uploadDocumentToOrgTeamV2                         │
│  │   Input: {                                                  │
│  │     fileName: 'document.pdf',                               │
│  │     encodedUploadData: 'base64...',                         │
│  │     orgId: '...',                                           │
│  │     folderId: '...'                                         │
│  │   }                                                         │
│  │                                                             │
│  ├── Response:                                                 │
│  │   {                                                         │
│  │     _id: 'doc-123',                                         │
│  │     name: 'document.pdf',                                   │
│  │     etag: 'xyz',                                            │
│  │     ...                                                     │
│  │   }                                                         │
│  │                                                             │
│  └── Display appropriate toast:                                │
│      ├── displayOrganizationToast() → Org uploads              │
│      └── displayOrgTeamToast() → Team uploads                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. UPDATE REDUX STATE - COMPLETED                             │
│                                                                 │
│  dispatch(updateUploadingFile({                                │
│    groupId: 'uuid-1',                                           │
│    status: 'COMPLETED',                                         │
│    progress: 100,                                               │
│    documentId: 'doc-123',                                       │
│    document: { _id: 'doc-123', ... }                            │
│  }));                                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. UPLOAD HANDLER - Continue Queue                            │
│                                                                 │
│  componentDidUpdate() detects:                                 │
│  ├── Previous file: COMPLETED                                  │
│  ├── Queue not empty                                           │
│  └── uploadFileSequence(remainingFiles)  ◄──── Process next    │
└─────────────────────────────────────────────────────────────────┘
```

### useUploadLogic Hook Details

The `useUploadLogic` hook centralizes upload logic and provides:

**Key Functions:**
- `onUploadHOC(data)` - Main upload orchestrator
- `onUpload(data, uploadFunction)` - Common upload logic
- `uploadDocumentToPersonal(data)` - Personal folder upload
- `uploadDocumentToOrganization(data)` - Organization folder upload
- `uploadDocumentToOrgTeam(data)` - Team folder upload
- `onUploadProgress(fileId)` - Progress tracking callback
- `displayOrganizationToast(uploadData)` - Organization upload toast
- `displayOrgTeamToast(uploadData)` - Team upload toast

**Hook Configuration:**
```javascript
const { onUploadHOC } = useUploadLogic({
  uploadServices,      // Service layer (documentServices/templateServices)
  enableCaching,       // Enable document caching (default: false)
  kind                 // DOCUMENT_KIND.DOCUMENT or DOCUMENT_KIND.TEMPLATE
});
```

**Folder Type Routing:**
```
folder.type === 'INDIVIDUAL'    → uploadDocumentToPersonal()
folder.type === 'ORGANIZATION'  → uploadDocumentToOrganization()
folder.type === 'TEAMS'         → uploadDocumentToOrgTeam()
```

---

## Template Upload Flow

### Key Differences from Document Upload

```
┌─────────────────────────────────────────────────────────────────┐
│ TEMPLATE UPLOAD - Key Differences                              │
└─────────────────────────────────────────────────────────────────┘

1. Handler Name
   Document: 'upload_document_handler'
   Template: 'upload_template_handler'

2. GraphQL Mutations
   Document: uploadDocumentToPersonalV2 / uploadDocumentToOrganizationV2 / uploadDocumentToOrgTeamV2
   Template: uploadDocumentTemplateToPersonal / uploadDocumentTemplateToOrganization / uploadDocumentTemplateToOrgTeam

3. Service Layer
   Document: documentServices, organizationServices
   Template: templateServices

4. Caching
   Document: YES - documentCacheBase.add()
   Template: NO - No caching

5. Event Tracking
   Document: UPLOAD_DOCUMENT event
   Template: UPLOAD_TEMPLATE event

6. Toast Messages
   Document: "uploaded to your Lumin Drive"
   Template: "uploaded to your Lumin Drive" (same, but different context)
```

### Template Upload Paths

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEMPLATE UPLOAD PATHS                        │
└─────────────────────────────────────────────────────────────────┘

Folder Type: INDIVIDUAL
└─> uploadDocumentTemplateToPersonal()
    └─> GraphQL: uploadDocumentTemplateToPersonal
        Input: { fileName, encodedUploadData, orgId }

Folder Type: ORGANIZATION
└─> uploadDocumentTemplateToOrganization()
    └─> GraphQL: uploadDocumentTemplateToOrganization
        Input: { fileName, encodedUploadData, orgId, isNotify }

Folder Type: TEAMS
└─> uploadDocumentTemplateToOrgTeam()
    └─> GraphQL: uploadDocumentTemplateToOrgTeam
        Input: { fileName, encodedUploadData, teamId }
```

---

## Handler Registration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT MOUNT - Handler Registration                         │
└─────────────────────────────────────────────────────────────────┘

1. Component Tree Rendered
   │
   ▼
┌──────────────────────────────────────┐
│ withUploadContainer                  │
│   wraps component in <UploadHandler> │
│   provides: handlerName prop         │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ UploadHandler (render props)         │
│   provides: handleUploadProgress fn  │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ withUploadHandler (Class Component)  │
│                                      │
│ Props received:                      │
│   - handlerName: string              │
│   - handleUploadProgress: function   │
└───────────────┬──────────────────────┘
                │
                ▼ constructor()
┌──────────────────────────────────────┐
│ uploadServices.registerHandler()     │
│                                      │
│ Input:                               │
│   name: 'upload_document_handler'    │
│   handler: handleUploadProgress fn   │
│                                      │
│ Registry (in memory):                │
│   {                                  │
│     'upload_document_handler': fn,   │
│     'upload_template_handler': fn    │
│   }                                  │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ UPLOAD TRIGGERED - Handler Retrieval                           │
└─────────────────────────────────────────────────────────────────┘

File added to Redux
   │
   ▼
withUploadHandler.componentDidUpdate()
   │
   ▼
uploadFileSequence(uploadList)
   │
   ▼ for each file
┌──────────────────────────────────────┐
│ Get handler by name                  │
│                                      │
│ const handler =                      │
│   uploadServices.getUploadHandler(   │
│     fileUpload.handlerName           │
│   );                                 │
│                                      │
│ // Returns the registered function   │
│ // handler === handleUploadProgress  │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ Execute handler                      │
│                                      │
│ await handler(fileUpload);           │
│ // Calls handleUploadProgress        │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ COMPONENT UNMOUNT - Cleanup                                     │
└─────────────────────────────────────────────────────────────────┘

Component unmounting
   │
   ▼
componentWillUnmount()
   │
   ▼
uploadServices.removeHandler(handlerName)
   │
   ▼
Registry cleaned up
```

---

## Upload Queue Processing

```
┌─────────────────────────────────────────────────────────────────┐
│ UPLOAD QUEUE - Sequential Processing                           │
└─────────────────────────────────────────────────────────────────┘

Redux State: uploading.files
┌──────────────────────────────────────┐
│ [                                    │
│   { groupId: '1', status: 'PENDING' }│ ◄── File 1
│   { groupId: '2', status: 'PENDING' }│ ◄── File 2
│   { groupId: '3', status: 'PENDING' }│ ◄── File 3
│ ]                                    │
└──────────────────────────────────────┘
   │
   ▼ uploadFileSequence()
┌──────────────────────────────────────┐
│ Process File 1                       │
│ ├── Get handler                      │
│ ├── Update status: UPLOADING         │
│ ├── Upload to S3 (with progress)     │
│ ├── Create document record           │
│ └── Update status: COMPLETED         │
└──────────────────────────────────────┘
   │
   │ (Sequential - wait for completion)
   │
   ▼ componentDidUpdate() triggered
┌──────────────────────────────────────┐
│ Process File 2                       │
│ ├── Get handler                      │
│ ├── Update status: UPLOADING         │
│ ├── Upload to S3 (with progress)     │
│ ├── Create document record           │
│ └── Update status: COMPLETED         │
└──────────────────────────────────────┘
   │
   │ (Sequential - wait for completion)
   │
   ▼ componentDidUpdate() triggered
┌──────────────────────────────────────┐
│ Process File 3                       │
│ ├── Get handler                      │
│ ├── Update status: UPLOADING         │
│ ├── Upload to S3 (with progress)     │
│ ├── Create document record           │
│ └── Update status: COMPLETED         │
└──────────────────────────────────────┘
   │
   ▼ All files completed
┌──────────────────────────────────────┐
│ Queue Empty                          │
│ ├── uploadingFiles.length = 0       │
│ └── OR all status = COMPLETED/ERROR  │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ WHY SEQUENTIAL?                                                 │
└─────────────────────────────────────────────────────────────────┘

Advantages:
  ✓ Prevents network congestion
  ✓ Better progress tracking UX
  ✓ Easier error handling
  ✓ Reduces server load
  ✓ More predictable behavior

Trade-off:
  ✗ Slower total upload time for multiple files
  
Future Consideration:
  ○ Parallel upload for premium users
  ○ Configurable concurrency limit
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ ERROR HANDLING - Multi-Level Approach                          │
└─────────────────────────────────────────────────────────────────┘

Level 1: VALIDATION (Pre-Upload)
┌──────────────────────────────────────┐
│ UploadContainer.prepareFileUpload    │
│                                      │
│ Checks:                              │
│ ├── File type valid?                 │
│ │   └─X─> Toast: "File type..."     │
│ ├── File size OK?                    │
│ │   └─X─> Toast: "File size..."     │
│ └── Upload permission?               │
│     └─X─> Toast: "No permission..."  │
│                                      │
│ ✓ All passed                         │
│ └──> Add to Redux queue              │
└──────────────────────────────────────┘

Level 2: UPLOAD (During S3 Upload)
┌──────────────────────────────────────┐
│ uploadFilesToS3()                    │
│                                      │
│ try {                                │
│   await upload to S3                 │
│ } catch (error) {                    │
│   if (error.code === 'ECONNABORTED') │
│     └─X─> Network timeout            │
│   if (axios.isCancel(error))         │
│     └─X─> User cancelled             │
│   else                               │
│     └─X─> S3 upload failed           │
│ }                                    │
│                                      │
│ Error Action:                        │
│ ├── updateUploadingFile({            │
│ │     status: 'ERROR',               │
│ │     error: errorMessage            │
│ │   })                               │
│ ├── Display error toast              │
│ └── Return fileUpload for retry      │
└──────────────────────────────────────┘

Level 3: API (Document Creation)
┌──────────────────────────────────────┐
│ createDocumentRecord()               │
│                                      │
│ try {                                │
│   const doc = await API call         │
│ } catch (error) {                    │
│   if (error.status === 400)          │
│     └─X─> Invalid request            │
│   if (error.status === 403)          │
│     └─X─> Permission denied          │
│   if (error.status === 500)          │
│     └─X─> Server error               │
│ }                                    │
│                                      │
│ Error Action:                        │
│ ├── Log error to logger              │
│ ├── updateUploadingFile({            │
│ │     status: 'ERROR',               │
│ │     error: errorMessage            │
│ │   })                               │
│ ├── Display error toast              │
│ └── Return fileUpload for retry      │
└──────────────────────────────────────┘

Level 4: RETRY LOGIC
┌──────────────────────────────────────┐
│ uploadFileSequence() retry           │
│                                      │
│ const failedTasks = [];              │
│                                      │
│ for (const file of uploadList) {     │
│   const failed = await handler(file);│
│   if (failed) {                      │
│     failedTasks.push(failed);        │
│   }                                  │
│ }                                    │
│                                      │
│ if (failedTasks.length) {            │
│   // Get restart tasks               │
│   const restartList =                │
│     failedTasks.map(getRestartTask)  │
│                    .filter(Boolean);  │
│                                      │
│   if (restartList.length) {          │
│     // Retry failed uploads          │
│     uploadFileSequence(restartList); │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ERROR STATE IN REDUX                                            │
└─────────────────────────────────────────────────────────────────┘

{
  groupId: 'uuid-1',
  fileName: 'document.pdf',
  status: 'ERROR',
  error: 'Network timeout. Please try again.',
  progress: 45,  // Where it failed
  cancelToken: CancelToken,
  // ... other fields
}

UI Display:
┌──────────────────────────────────────┐
│ [!] document.pdf                     │
│     Network timeout. Try again.      │
│     [Retry] [Cancel]                 │
└──────────────────────────────────────┘
```

---

## Drag & Drop Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ DRAG & DROP - User Interaction                                 │
└─────────────────────────────────────────────────────────────────┘

1. User Starts Dragging File Over Window
   │
   ▼
┌──────────────────────────────────────┐
│ onDragEnter / onDragOver             │
│                                      │
│ const {                              │
│   setName,                           │
│   setFolderDraggingOver              │
│ } = useContext(                      │
│   DropDocumentPopupContext           │
│ );                                   │
│                                      │
│ setName('My Documents');             │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ TopPopup.DropDocument Appears        │
│                                      │
│ ┌────────────────────────────────┐  │
│ │  Drop files here to upload     │  │
│ │  Destination: My Documents     │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘

2. User Hovers Over Specific Folder
   │
   ▼
┌──────────────────────────────────────┐
│ Folder.onDragOver                    │
│                                      │
│ setFolderDraggingOver({              │
│   name: 'Projects',                  │
│   _id: 'folder-123',                 │
│   type: 'INDIVIDUAL'                 │
│ });                                  │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ Popup Updates                        │
│                                      │
│ ┌────────────────────────────────┐  │
│ │  Drop files here to upload     │  │
│ │  Destination: Projects         │  │◄── Updated
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘

3. User Drops Files
   │
   ▼
┌──────────────────────────────────────┐
│ onDrop Event                         │
│                                      │
│ event.preventDefault();              │
│ const files =                        │
│   Array.from(                        │
│     event.dataTransfer.files         │
│   );                                 │
│                                      │
│ const { onUpload } = useContext(     │
│   DropDocumentPopupContext           │
│ );                                   │
│                                      │
│ await onUpload(files, {              │
│   uploadFrom: 'drag_drop',           │
│   folder: folderDraggingOver         │
│ });                                  │
│                                      │
│ // Clean up                          │
│ setName(null);                       │
│ setFolderDraggingOver(null);         │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ Normal Upload Flow Continues         │
│ (See Document Upload Flow diagram)   │
└──────────────────────────────────────┘

4. User Drags Away (Without Dropping)
   │
   ▼
┌──────────────────────────────────────┐
│ onDragLeave / onDragEnd              │
│                                      │
│ setName(null);                       │
│ setFolderDraggingOver(null);         │
└───────────────┬──────────────────────┘
                │
                ▼
┌──────────────────────────────────────┐
│ Popup Disappears                     │
└──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ CONTEXT STATE DURING DRAG & DROP                               │
└─────────────────────────────────────────────────────────────────┘

Initial State:
{
  name: null,
  folderDraggingOver: null,
  setName: fn,
  setFolderDraggingOver: fn,
  onUpload: fn,
  canUpload: true
}

During Drag Over:
{
  name: 'My Documents',
  folderDraggingOver: null,
  ...
}

Hovering Over Folder:
{
  name: 'My Documents',
  folderDraggingOver: {
    name: 'Projects',
    _id: 'folder-123',
    type: 'INDIVIDUAL'
  },
  ...
}

After Drop:
{
  name: null,              ◄── Reset
  folderDraggingOver: null, ◄── Reset
  ...
}
```

---

## Redux State Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│ REDUX STATE - Upload Lifecycle                                 │
└─────────────────────────────────────────────────────────────────┘

Initial State:
{
  uploading: {
    files: []
  }
}

─────────────────────────────────────────

Action: addUploadingFiles([fileUpload])
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        fileName: 'document.pdf',
        status: 'PENDING',    ◄── Initial status
        progress: 0,
        file: File,
        thumbnail: File,
        handlerName: 'upload_document_handler',
        folder: {...},
        cancelToken: null,
        error: null,
        document: null
      }
    ]
  }
}

─────────────────────────────────────────

Action: updateUploadingFile({ groupId: 'uuid-1', status: 'UPLOADING' })
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        status: 'UPLOADING',  ◄── Updated
        progress: 0,
        ...
      }
    ]
  }
}

─────────────────────────────────────────

Action: updateUploadingFile({ groupId: 'uuid-1', progress: 25 })
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        status: 'UPLOADING',
        progress: 25,         ◄── Updated
        ...
      }
    ]
  }
}

─────────────────────────────────────────

Action: updateUploadingFile({ groupId: 'uuid-1', progress: 50 })
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        status: 'UPLOADING',
        progress: 50,         ◄── Updated
        ...
      }
    ]
  }
}

─────────────────────────────────────────

Action: updateUploadingFile({
  groupId: 'uuid-1',
  status: 'COMPLETED',
  progress: 100,
  document: { _id: 'doc-123', ... }
})
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        status: 'COMPLETED',  ◄── Final status
        progress: 100,
        document: {           ◄── Result
          _id: 'doc-123',
          name: 'document.pdf',
          ...
        },
        ...
      }
    ]
  }
}

─────────────────────────────────────────

Alternative: Error State

Action: updateUploadingFile({
  groupId: 'uuid-1',
  status: 'ERROR',
  error: 'Network timeout'
})
{
  uploading: {
    files: [
      {
        groupId: 'uuid-1',
        status: 'ERROR',      ◄── Error status
        progress: 45,         ◄── Where it stopped
        error: 'Network timeout', ◄── Error message
        document: null,
        ...
      }
    ]
  }
}
```

---

## Performance Optimization Points

```
┌─────────────────────────────────────────────────────────────────┐
│ PERFORMANCE OPTIMIZATIONS IN UPLOAD SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

1. PDF Linearization (Trade-off)
   ┌────────────────────────────────────┐
   │ Before Upload                      │
   │ ├── Linearize PDF (slower upload)  │
   │ └── Benefit: Faster viewer loading │
   └────────────────────────────────────┘

2. Thumbnail Compression
   ┌────────────────────────────────────┐
   │ Before Upload                      │
   │ ├── Compress to 70% quality        │
   │ ├── Max width: 800px               │
   │ └── Benefit: Reduced S3 storage    │
   └────────────────────────────────────┘

3. Parallel S3 Uploads
   ┌────────────────────────────────────┐
   │ Upload Phase                       │
   │ ├── Promise.all([                  │
   │ │     uploadDocument(),            │
   │ │     uploadThumbnail()            │
   │ │   ])                             │
   │ └── Benefit: Faster total time     │
   └────────────────────────────────────┘

4. Context Memoization
   ┌────────────────────────────────────┐
   │ withDropDocPopupProvider           │
   │ ├── useMemo(contextValue, deps)    │
   │ └── Benefit: Prevent re-renders    │
   └────────────────────────────────────┘

5. Sequential Queue Processing
   ┌────────────────────────────────────┐
   │ Upload Queue                       │
   │ ├── One file at a time             │
   │ └── Benefit: Stable network usage  │
   └────────────────────────────────────┘

6. Object URL Cleanup
   ┌────────────────────────────────────┐
   │ After Processing                   │
   │ ├── URL.revokeObjectURL(url)       │
   │ └── Benefit: Prevent memory leaks  │
   └────────────────────────────────────┘

7. Redux Batch Updates
   ┌────────────────────────────────────┐
   │ State Updates                      │
   │ ├── Single updateUploadingFile()   │
   │ │   with multiple fields           │
   │ └── Benefit: Fewer re-renders      │
   └────────────────────────────────────┘
```

---

**Visual Legend:**
- `│` : Flow direction
- `▼` : Continues down
- `└─>` : Leads to
- `├──` : Branch
- `◄──` : Indicator/Note
- `└─X─>` : Error path
- `✓` : Success
- `✗` : Failure

---

**Last Updated**: November 19, 2025  
**Documentation Version**: 2.1  
**Key Changes**: Updated to reflect `useUploadLogic` hook architecture

