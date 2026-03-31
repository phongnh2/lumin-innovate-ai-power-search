import { store } from 'store';

import downloadPdf from 'helpers/downloadPdf';

import { ToolCallType } from 'features/EditorChatBot/types';

export async function downloadFile(toolCall: ToolCallType) {
  const { mimeType } = toolCall.args as { mimeType: string };
  await downloadPdf(store.dispatch, { downloadType: mimeType });
  return 'Download success';
}
