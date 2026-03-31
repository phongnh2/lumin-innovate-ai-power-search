export default (redactionAnnotations, value) => {
  if (redactionAnnotations.length) {
    redactionAnnotations.forEach((redaction) => {
      redaction.IsHoverable = value;
    });
  }
};
