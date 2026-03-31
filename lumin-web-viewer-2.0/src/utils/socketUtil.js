import { SOCKET_EMIT } from 'constants/socketConstant';

import { socket } from '../socket';

// eslint-disable-next-line default-param-last
function socketEmitSendEmailComment(commenter, documentId, time = new Date(), commentContent) {
  socket.emit(SOCKET_EMIT.SEND_EMAIL_COMMENT_DOC, {
    commenter,
    documentId,
    time,
    comment: commentContent,
  });
}

function socketEmitSendEmailMention(commenter, documentId, commentContent, annotationData, taggedUsers) {
  socket.emit(SOCKET_EMIT.SEND_MENTION_EMAIL, {
    commenter,
    documentId,
    comment: commentContent,
    annotation: annotationData,
    taggedUsers,
  });
}

function socketEmitSendEmailReply(commenter, documentId, ownerComment, commenterEmails, annotationData, replyContent) {
  socket.emit(SOCKET_EMIT.SEND_EMAIL_REPLY_COMMENT, {
    commenter,
    documentId,
    ownerComment,
    commenterEmails,
    annotation: annotationData,
    replyContent,
  });
}

function socketEmitSendUpdateDocument(documentId, previousDocumentData) {
  socket.emit(SOCKET_EMIT.UPDATE_DOCUMENT, {
    roomId: documentId,
    type: 'updateService',
    previousDocumentData,
  });
}

export default {
  socketEmitSendEmailComment,
  socketEmitSendEmailMention,
  socketEmitSendEmailReply,
  socketEmitSendUpdateDocument,
};
