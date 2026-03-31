export const INTEGRATE_BANANASIGN_BYTE_MAXIMUM = 20 * 1024 * 1024; // 20MB in bytes

export const AUTO_SYNC_BYTE_MAXIMUM = 20 * 1024 * 1024; // 20MB in bytes

export const TRANSFER_FILE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB in bytes

export const CONVERT_TO_ANOTHER_TYPE_SIZE_LIMIT = 100 * 1024 * 1024; // 100MB in bytes
/**
 * Maximum file size threshold for multipart Google Drive uploads.
 *
 * When using multipart uploads, the entire file is converted to base64 and sent in a single request.
 * Files larger than this limit will automatically use resumable upload instead because:
 *
 * 1. Base64 encoding increases file size by ~33%, consuming more memory
 * 2. JavaScript has a maximum string length limit (~512MB)
 *
 * The 200MB limit provides a safe margin before reaching JavaScript's string size limitations.
 */
export const MAXIMUM_MULTIPART_DRIVE_UPLOAD_LIMIT = 200 * 1024 * 1024; // 200MB in bytes

export const MAX_IMAGE_SIZE_IN_BYTES = 2 * 1024 * 1024; // 2MB
