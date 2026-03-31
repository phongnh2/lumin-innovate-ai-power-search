import React from 'react';
import PropTypes from 'prop-types';
import { shallowEqual, useSelector } from 'react-redux';
import { capitalize } from 'lodash';
import { Trans } from 'react-i18next';
import selectors from 'selectors';
import UserEventConstants from 'constants/eventConstants';
import fileUtils from 'utils/file';

const HightLight = <span className="ActivityItem__Content-Highlight" />;
const DocName = <span className="ActivityItem__Content-DocName" />;

function ActivityDocumentItem(props) {
  const { activity } = props;
  const { actor, target, eventName, document } = activity;
  const { _id: actorId, name: actorName } = actor || {};
  const documentName = fileUtils.getShortFilename(document.name);

  const currentUser = useSelector(selectors.getCurrentUser, shallowEqual);

  const singleEventText = (eventText) => {
    let key;
    if (currentUser._id === actorId) {
      key = `activityDocument.you${capitalize(eventText)}`;
      return (
        <span>
          <Trans i18nKey={key} components={{ Text: DocName }} values={{ documentName }} />
        </span>
      );
    }
    key = `activityDocument.actor${capitalize(eventText)}`;
    return (
      <span>
        <Trans i18nKey={key} components={{ b: HightLight, Text: DocName }} values={{ actorName, documentName }} />
      </span>
    );
  };

  const commentText = (action) => {
    let key = '';
    if (currentUser._id === actorId) {
      if (currentUser._id === target._id) {
        key = `activityDocument.you${action}YourComment`;
        return <Trans i18nKey={key} components={{ Text: DocName }} values={{ documentName }} />;
      }
      key = `activityDocument.you${action}AnotherComment`;
      return (
        <Trans
          i18nKey={key}
          components={{ Text: DocName, b: HightLight }}
          values={{ documentName, target: target?.name }}
        />
      );
    }
    if (currentUser._id === target._id) {
      key = `activityDocument.someOne${action}YourComment`;
      return (
        <Trans
          i18nKey={key}
          components={{ b: HightLight, Text: DocName }}
          values={{ actorName, documentName, target: target?.name }}
        />
      );
    }
    key = `activityDocument.someOne${action}AnotherComment`;
    return (
      <Trans
        i18nKey={key}
        components={{ b: HightLight, Text: DocName }}
        values={{ actorName, documentName, target: target?.name }}
      />
    );
  };

  const shareDocumentText = () => {
    if (currentUser._id === actorId) {
      return (
        <Trans
          i18nKey="activityDocument.youShared"
          components={{ b: HightLight, Text: DocName }}
          values={{ documentName, target: target?.name || target?.email }}
        />
      );
    }
    if (currentUser._id === target._id) {
      return (
        <Trans
          i18nKey="activityDocument.actorSharedWithYou"
          components={{ b: HightLight, Text: DocName }}
          values={{ actorName, documentName }}
        />
      );
    }
    return (
      <Trans
        i18nKey="activityDocument.actorSharedWithAnotherActor"
        components={{ b: HightLight, Text: DocName }}
        values={{ actorName, documentName, target: target?.name || target?.email }}
      />
    );
  };

  const requestAccessText = () => {
    if (currentUser._id === actorId) {
      return <Trans i18nKey="activityDocument.youRequested" components={{ Text: DocName }} values={{ documentName }} />;
    }
    return (
      <Trans
        i18nKey="activityDocument.someOneRequested"
        components={{
          b: HightLight,
          Text: DocName,
        }}
        values={{ actorName, documentName }}
      />
    );
  };

  const mentionText = () => {
    if (currentUser._id === actorId) {
      return (
        <Trans
          i18nKey="activityDocument.youMentiond"
          components={{ b: HightLight, Text: DocName }}
          values={{ target: target?.name, documentName }}
        />
      );
    }
    if (currentUser._id === target._id) {
      return (
        <Trans
          i18nKey="activityDocument.actorMentionedYou"
          components={{ b: HightLight, Text: DocName }}
          values={{ actorName, documentName }}
        />
      );
    }
    return (
      <Trans
        i18nKey="activityDocument.actorMentionedYou"
        components={{ b: HightLight, Text: DocName }}
        values={{ actorName, target: target?.name, documentName }}
      />
    );
  };

  let activityTitle = null;
  switch (eventName) {
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_UPLOADED:
      activityTitle = singleEventText('uploaded');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_OPENED:
      activityTitle = singleEventText('opened');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_DELETED:
      activityTitle = singleEventText('deleted');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_ANNOTATED:
      activityTitle = singleEventText('annotated');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_SIGNED:
      activityTitle = singleEventText('signed');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_COMMENTED:
      activityTitle = singleEventText('commented on');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_MANIPULATED:
      activityTitle = singleEventText('manipulated');
      break;
    case UserEventConstants.Events.DocumentEvents.COMMENT_REPLIED:
      activityTitle = commentText('RepliedTo');
      break;
    case UserEventConstants.Events.DocumentEvents.COMMENT_MENTIONED:
      activityTitle = mentionText();
      break;
    case UserEventConstants.Events.DocumentEvents.COMMENT_DELETED:
      activityTitle = commentText('Deleted');
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_SHARED:
      activityTitle = shareDocumentText();
      break;
    case UserEventConstants.Events.DocumentEvents.DOCUMENT_REQUESTED_TO_ACCESS:
      activityTitle = requestAccessText();
      break;
    default:
      break;
  }

  return (
    <>
      <p className="ActivityItem__Content-title">{activityTitle}</p>
      {document.comment && <p className="ActivityItem__Content-Comment">{document.comment.content}</p>}
    </>
  );
}

ActivityDocumentItem.propTypes = {
  activity: PropTypes.object.isRequired,
};

export default React.memo(ActivityDocumentItem);
