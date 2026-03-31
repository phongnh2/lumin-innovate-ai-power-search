import Handlebars from 'handlebars';
import mjml2html from 'mjml';

import { promises as fs } from 'fs';
import path from 'path';

const registerPartials = Promise.all([registerPartial('layout', '_layout.hbs')]);

export function newTemplate<T>(filename: string, defaultProps?: { title: string }) {
  const commonProps = {
    assetsUrl: 'https://assets.luminpdf.com'
  };
  const readTemplate = registerPartials.then(() => readHbs(filename));

  return async (props: T) => {
    const template = await readTemplate;

    const mjml = template({
      ...commonProps,
      ...defaultProps,
      ...props
    });

    const result = await mjml2html(mjml);
    if (result.errors?.length > 0) {
      throw new Error(result.errors[0].formattedMessage);
    }
    return result.html;
  };
}

async function readHbs(relpath: string) {
  const basePath = 'lib/mjml/templates';

  const filepath = path.normalize(path.join(basePath, relpath));
  const file = await fs.readFile(filepath);
  const hbs = file.toString();
  return Handlebars.compile(hbs);
}

async function registerPartial(name: string, filename: string) {
  const hbs = await readHbs(filename);
  return Handlebars.registerPartial(name, hbs);
}
