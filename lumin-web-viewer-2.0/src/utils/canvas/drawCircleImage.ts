export const drawCircleImage = ({
  ctx,
  image,
  size,
}: {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  size: number;
}) => {
  const imgSize = Math.min(image.width, image.height);
  const x = (image.width - imgSize) / 2;
  const y = (image.height - imgSize) / 2;
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.clip();
  ctx.drawImage(image, x, y, imgSize, imgSize, 0, 0, size, size);
};
