import { cachingFileHandler } from 'HOC/OfflineStorageHOC';

import { documentGraphServices } from 'services/graphServices';

export default async (currentDocument, bookmarksInstance) => {
  const cachedDocument = await cachingFileHandler.get(currentDocument._id);
  const cachedBookmarks = cachedDocument.bookmarks ? JSON.parse(cachedDocument.bookmarks) : [];
  const oldBookmarks = currentDocument.bookmarks ? JSON.parse(currentDocument.bookmarks) : [];
  const newBookmarks = cachedBookmarks.filter(
    (cachedBookmark) => !oldBookmarks.some((oldBookmark) => cachedBookmark.page === oldBookmark.page)
  );

  const removedBookmarks = oldBookmarks.filter(
    (oldBookmark) => !cachedBookmarks.some((cachedBookmark) => oldBookmark.page === cachedBookmark.page)
  );

  const bookmarkData = [];

  if (newBookmarks.length !== 0) {
    Promise.all(
      newBookmarks.map(async (element) => {
        await bookmarkData.push({ page: parseInt(element.page), message: element.bookmark[0].message });
      })
    );
  }
  if (removedBookmarks.length !== 0) {
    Promise.all(
      removedBookmarks.map(async (element) => {
        await bookmarkData.push({ page: parseInt(element.page), message: '' });
      })
    );
  }
  bookmarksInstance.updateBookmarkByArray(bookmarkData);
  cachingFileHandler.updateDocumentBookmarkInCachingFileById(currentDocument._id, cachedBookmarks);

  const newImagesRemoteIds = Object.keys(currentDocument.imageSignedUrls || {});
  const remoteIdsNeedToDelete =
    cachedDocument.deletedImageRemoteIds?.filter((remoteId) => newImagesRemoteIds.indexOf(remoteId) !== -1) ?? [];
  if (remoteIdsNeedToDelete.length) {
    await documentGraphServices.deleteDocumentImages({
      documentId: currentDocument._id,
      remoteIds: remoteIdsNeedToDelete,
    });
    const newImageSignedUrls = currentDocument.imageSignedUrls;
    remoteIdsNeedToDelete.forEach((remoteId) => {
      delete newImageSignedUrls[remoteId];
    });
    cachingFileHandler.update({ imageSignedUrls: newImageSignedUrls }, { shouldOverwriteImageSignUrls: true });
  }
};
