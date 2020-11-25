import * as fs from 'fs-extra';
import { ImportJson } from '../interface/common';
import { WriteStream } from 'fs-extra';
import { last } from 'lodash';
import * as handlebars from 'handlebars';

type ImportKey = 'COMPONENTS' | 'ENTRY_COMPONENTS' | 'SERVICES' | 'MODULES';

export function downloadTmpFromLocal(from: string, to: string): void {
  try {
    fs.copySync(`/usr/local/lib/node_modules/dg-cli/lib/${from}`, to);
  } catch (err) {
    throw new Error('Fail to download template ' + err);
  }
}

/**
 * 更新依赖文件，extra_import.ts
 * @export
 * @param {ImportJson} extraImport 额外添加的json
 * @returns {void}
 */
export function importExtraFiles(extraImport: ImportJson): void {
  try {
    const { ws, content } = updateLocalImportJson(extraImport);
    const obj = {} as { [key: string]: string };

    for (const key in content) {
      for (const name in content[<ImportKey>key]) {
        const tempPath = content[<ImportKey>key][name];
        if (obj[tempPath]) continue;

        ws.write(`import { ${name} } from '${tempPath}'\n`);
        obj[tempPath] = tempPath;
      }
      ws.write(`export const EXTRA_${key} = [${Object.keys(content[<ImportKey>key])}]\n`);
    }
    ws.close();
  } catch (err) {
    throw new Error('Fail to import dependencies ' + err);
  }
}

/**
 * 更新用户本地的extra_imports.json
 * @param {ImportJson} extraImport
 * @returns {{ ws: WriteStream; content: ImportJson }}
 */
function updateLocalImportJson(extraImport: ImportJson): { ws: WriteStream; content: ImportJson } {
  const importPath = cwd() + '/src/app/shared/extra_imports.json';
  const content = JSON.parse(fs.readFileSync(importPath, 'utf-8')) as ImportJson;

  for (const key in content) {
    content[<ImportKey>key] = Object.assign({}, content[<ImportKey>key], extraImport[<ImportKey>key]);
  }
  fs.writeFileSync(importPath, JSON.stringify(content, null, '\t'));

  return { ws: fs.createWriteStream(cwd() + '/src/app/shared/extra_imports.ts'), content };
}

export function getDirname(): string {
  return last(cwd().split('/')) as string;
}

/**
 * handlebars render
 * @export
 * @param {string} path
 * @param {*} data
 */
export function render(path: string, data: any): void {
  try {
    const content = fs.readFileSync(path, 'utf-8');
    const result = handlebars.compile(content)(data);

    fs.writeFileSync(path, result);
  } catch (err) {
    throw new Error('Fail to compile template ' + err);
  }
}

export function cwd(): string {
  const reg = /(\!|\"|\$|\&|\'|\(|\)|\*|\,|\:|\;|\<|\=|\>|\?|\@|\[|\\|\]|\^|\`|\{|\||\})+/g; // 路径特殊字符转义

  return process.cwd().replace(reg, `\$&`);
}
