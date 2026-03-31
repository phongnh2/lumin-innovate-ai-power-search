export const filterHighlightMarkdown = (message: string) =>
  message.replace(/<mark><span contenteditable='false'>\[(.*?)\]<\/span><\/mark>/g, '$1');
