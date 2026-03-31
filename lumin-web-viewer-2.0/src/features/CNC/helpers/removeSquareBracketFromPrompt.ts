const SQUARE_BRACKET_REGEX = /\[|\]/g;

const removeSquareBracketFromPrompt = (prompt: HTMLDivElement | null) => {
  if (!prompt) {
    return '';
  }

  const promptNodes = prompt.cloneNode(true) as HTMLDivElement;
  promptNodes.querySelectorAll('mark').forEach((mark) => {
    mark.innerHTML = mark.innerHTML.replace(SQUARE_BRACKET_REGEX, '');
  });

  return promptNodes.innerText.trim();
};

const removeSquareBracketFromSamplePrompt = (prompt: string | undefined) => {
  if (!prompt) {
    return '';
  }

  const div = document.createElement('div');
  div.innerHTML = prompt;
  return removeSquareBracketFromPrompt(div);
};

export { removeSquareBracketFromPrompt, removeSquareBracketFromSamplePrompt };
