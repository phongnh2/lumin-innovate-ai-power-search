import core from 'core';

import { avatar, hashColorFromUserName } from 'utils';
import { drawCircleImage } from 'utils/canvas';

import { CUSTOM_DATA_COMMENT } from 'constants/customDataConstant';

const BACKGROUND_PADDING = 4;
const AVATAR_IMAGE_PADDING = 4;
const AVATAR_IMAGE_SIZE = 24;
const AVATAR_CENTER_X = 12;
const AVATAR_CENTER_Y = 12;

function drawStickyBackground(this: Core.Annotations.StickyAnnotation, ctx: CanvasRenderingContext2D) {
  const annotManager = core.getAnnotationManager();
  const path = new Path2D(
    'M32 16C32 24.8366 24.8366 32 16.0001 32C11.5718 32 9.3335 32 0 32C0.000442503 26 0.000149726 20.4083 0.000149726 16C0.000149726 7.16344 7.16356 0 16.0001 0C24.8366 0 32 7.16344 32 16Z'
  );
  const rotationAngle = window.Core.Annotations.RotationUtils.getRotationAngleInRadiansByDegrees(this.Rotation);
  const currentRect = this.getRect();
  const transformedRect = new window.Core.Math.Rect(
    currentRect.x1,
    currentRect.y1 - this.Height,
    currentRect.x2,
    currentRect.y1
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const unrotatedBoundingBox = window.Core.Annotations.RotationUtils.getUnrotatedDimensionsFromRectangularAnnotations(
    transformedRect,
    rotationAngle
  ) as unknown as { x: number; y: number; width: number; height: number };
  ctx.beginPath();
  ctx.translate(unrotatedBoundingBox.x + BACKGROUND_PADDING, unrotatedBoundingBox.y + BACKGROUND_PADDING);
  ctx.fillStyle = this.StrokeColor.toString();
  ctx.globalAlpha = Number(this.Opacity);
  ctx.fill(path);

  if (annotManager.isAnnotationSelected(this)) {
    const { R, G, B } = this.StrokeColor;
    ctx.strokeStyle = `rgb(${R},${G},${B},0.5)`;
    ctx.lineWidth = 8;
    ctx.stroke(path);
  }
}

function drawAnonymousAvatar(ctx: CanvasRenderingContext2D) {
  const path = new Path2D(
    'M22.9283 22.1597C21.9332 20.3602 20.3397 19.0105 18.4541 18.3701C19.3574 17.8058 20.0593 16.9457 20.452 15.9219C20.8446 14.8981 20.9063 13.7673 20.6276 12.7031C20.3489 11.639 19.7452 10.7003 18.9092 10.0313C18.0731 9.36232 17.0511 9 15.9999 9C14.9488 9 13.9268 9.36232 13.0907 10.0313C12.2547 10.7003 11.651 11.639 11.3723 12.7031C11.0936 13.7673 11.1553 14.8981 11.5479 15.9219C11.9406 16.9457 12.6425 17.8058 13.5458 18.3701C11.6603 19.0105 10.0668 20.3601 9.0717 22.1595C9.0248 22.2446 9.00007 22.3412 9 22.4395C8.99993 22.5379 9.02453 22.6345 9.07132 22.7197C9.11811 22.8049 9.18543 22.8756 9.26653 22.9248C9.34762 22.974 9.43962 22.9999 9.53327 22.9999L22.4667 23C22.5604 23 22.6524 22.9741 22.7335 22.9249C22.8146 22.8757 22.8819 22.805 22.9287 22.7198C22.9755 22.6346 23.0001 22.538 23 22.4397C22.9999 22.3414 22.9752 22.2448 22.9283 22.1597L22.9283 22.1597Z'
  );
  ctx.beginPath();
  ctx.translate(AVATAR_IMAGE_PADDING, AVATAR_IMAGE_PADDING);
  ctx.arc(AVATAR_CENTER_X, AVATAR_CENTER_Y, AVATAR_IMAGE_SIZE / 2, 0, 2 * Math.PI, false);
  ctx.fillStyle = '#DAE4EC';
  ctx.fill();

  ctx.beginPath();
  ctx.scale(0.75, 0.75);
  ctx.fillStyle = '#618298';
  ctx.fill(path);
}

function drawImageAvatar(
  this: Core.Annotations.StickyAnnotation,
  {
    ctx,
    name,
    avatarRemoteId,
  }: {
    ctx: CanvasRenderingContext2D;
    name: string;
    avatarRemoteId: string;
  }
) {
  const avatarUrl = avatar.getAvatar(avatarRemoteId);
  if (!this.avatarImage && avatarUrl) {
    const img = new Image();
    img.src = avatarUrl;
    img.onload = () => {
      this.avatarImage = img;
      core.getAnnotationManager().redrawAnnotation(this);
    };
  }

  ctx.translate(AVATAR_IMAGE_PADDING, AVATAR_IMAGE_PADDING);
  if (this.avatarImage) {
    drawCircleImage({
      ctx,
      size: AVATAR_IMAGE_SIZE,
      image: this.avatarImage,
    });
    return;
  }

  const textAvatar = avatar.getTextAvatar(name);
  const backgroundColor = hashColorFromUserName(textAvatar);
  ctx.beginPath();
  ctx.arc(AVATAR_CENTER_X, AVATAR_CENTER_Y, AVATAR_IMAGE_SIZE / 2, 0, 2 * Math.PI, false);
  ctx.fillStyle = backgroundColor;
  ctx.fill();

  ctx.font = '600 12px Inter';
  ctx.fillStyle = 'white';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(textAvatar, AVATAR_CENTER_X, AVATAR_CENTER_Y);
}

export function drawStickyAnnotation(this: Core.Annotations.StickyAnnotation, ctx: CanvasRenderingContext2D) {
  if (!this.isReply()) {
    let avatarSource = this.getCustomData(CUSTOM_DATA_COMMENT.AVATAR_SOURCE.key);
    if (!avatarSource) {
      avatarSource = JSON.stringify({
        name: this.Author,
      });
    }
    const { avatarRemoteId, name } = JSON.parse(avatarSource) as {
      avatarRemoteId: string;
      name: string;
    };
    drawStickyBackground.call(this, ctx);
    if (name || avatarRemoteId) {
      drawImageAvatar.call(this, {
        ctx,
        name,
        avatarRemoteId,
      });
    } else {
      drawAnonymousAvatar(ctx);
    }
  }
}
