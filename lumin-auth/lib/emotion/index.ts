// eslint-disable-next-line @next/next/no-document-import-in-page
import { cache } from '@emotion/css';
import createEmotionServer, { EmotionCritical } from '@emotion/server/create-instance';

class Emotion {
  // eslint-disable-next-line class-methods-use-this
  renderStatic(html: any): EmotionCritical {
    if (html === undefined) {
      throw new Error('did you forget to return html from renderToString?');
    }
    const { extractCritical } = createEmotionServer(cache);
    const { ids, css } = extractCritical(html);

    return { html, ids, css };
  }
}

export { Emotion };
export const emotion = new Emotion();
