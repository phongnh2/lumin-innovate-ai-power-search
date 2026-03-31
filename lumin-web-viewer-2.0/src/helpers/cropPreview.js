export const drawCropPreviewCanvas = ({
  canvas,
  width,
  height,
  top,
  left,
  bottom,
  right,
  coffientWidth,
  coffientHeight,
  cropPreviewBg = 'rgba(0, 0, 0, 0.5)',
  cropPreviewStroke = '#F2385A',
}) => {
  const ctx = canvas.getContext('2d');
  ctx.save();

  // Top Rectangle
  ctx.beginPath();
  ctx.fillStyle = cropPreviewBg;
  ctx.fillRect(0, 0, width * coffientWidth, top * coffientHeight);
  // Left Rectangle
  ctx.beginPath();
  ctx.fillStyle = cropPreviewBg;
  ctx.fillRect(0, top * coffientHeight, left * coffientWidth, (height - top) * coffientHeight);
  // Right Rectangle
  ctx.beginPath();
  ctx.fillStyle = cropPreviewBg;
  ctx.fillRect(
    (width - right) * coffientWidth,
    top * coffientHeight,
    right * coffientWidth,
    (height - top) * coffientHeight
  );
  // Bottom Rectangle
  ctx.beginPath();
  ctx.fillStyle = cropPreviewBg;
  ctx.fillRect(
    left * coffientWidth,
    (height - bottom) * coffientHeight,
    (width - left - right) * coffientWidth,
    bottom * coffientHeight
  );
  // Center Rectangle
  ctx.beginPath();
  ctx.lineWidth = '1';
  ctx.strokeStyle = cropPreviewStroke;
  ctx.rect(
    left * coffientWidth,
    top * coffientHeight,
    (width - right - left) * coffientWidth,
    (height - top - bottom) * coffientHeight
  );
  ctx.stroke();

  ctx.restore();
};
