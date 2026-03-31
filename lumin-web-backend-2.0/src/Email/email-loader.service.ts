import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';

import helpers from 'Email/mjml/helpers/Handlebars';

type CompiledFunction = (data: Record<string, unknown>) => string;

@Injectable()
class EmailLoaderService implements OnModuleInit {
  private readonly _caches: Record<string, CompiledFunction>;

  constructor() {
    this._caches = {};
  }

  onModuleInit(): void {
    helpers.register();
  }

  public async load(type: string): Promise<CompiledFunction> {
    const compiled = this._caches[type];
    if (compiled) {
      return compiled;
    }
    const newCompiled = await this.compileHandlebars(type);
    this._caches[type] = newCompiled;
    return newCompiled;
  }

  private async compileHandlebars(type: string): Promise<CompiledFunction> {
    const fileName = type.toLowerCase();
    const filePath = path.join(process.cwd(), 'dist', 'mjml', 'html', `${fileName}.html`);
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (error, htmlData) => {
        if (error) {
          reject(error);
        }
        const template = Handlebars.compile(htmlData);
        resolve(template);
      });
    });
  }
}

export { EmailLoaderService };
