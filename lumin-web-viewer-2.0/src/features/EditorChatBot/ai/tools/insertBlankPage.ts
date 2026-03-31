import core from 'core';

export async function insertBlankPage(page: number) {
  return core.getDocument().insertBlankPages([page + 1], 612, 792);
}
