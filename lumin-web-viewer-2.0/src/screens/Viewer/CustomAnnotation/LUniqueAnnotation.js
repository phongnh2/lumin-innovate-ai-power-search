class LUniqueAnnotation extends window.Core.Annotations.CustomAnnotation {
  constructor() {
    LUniqueAnnotation.SerializationType = LUniqueAnnotation.SerializationTypes.CUSTOM;
    super('lunique');
    this.Subject = 'LUnique';
    const begin = new window.Core.Math.Point(1, 1);
    const end = new window.Core.Math.Point(1, 1);

    this.vertices = [begin, end];
    this.Hidden = true;
    this.ReadOnly = true;
  }

  draw(ctx, pageMatrix) {
    this.setStyles(ctx, pageMatrix);

    ctx.beginPath();
    ctx.moveTo(this.vertices[0].x, this.vertices[0].y);
    ctx.lineTo(this.vertices[1].x, this.vertices[1].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export default LUniqueAnnotation;