import * as fs from 'fs-extra';
import { forEach } from 'lodash';
import { REPOSITORY } from '@config/constant';
import { log } from './logger';
import { cwd } from './path';
import * as path from 'path';
import { Readdir } from '@typings/common';

export function removeSync(url: string): void {
	try {
		fs.removeSync(url);
	} catch (err) {
		throw new Error('Fail to remove directory' + err);
	}
}

export function renameRepository(name: string): void {
	try {
		fs.renameSync(cwd() + `/${REPOSITORY}`, cwd() + `/${name}`);
	} catch (err) {
		throw new Error('Fail to rename project' + err);
	}
}

/**
 * 递归替换某文件夹下内容
 * @export
 * @param {string} dir 目标文件夹路径
 * @param {string} from 待替换内容
 * @param {string} to 新内容
 * @param {array} exclude 排除文件夹
 */
export function recursiveReplace(params: Readdir): void {
	const { dir, from, to, exclude = [] } = params;
	const files = fs.readdirSync(dir);

	forEach(files, (fileName: string) => {
		const newPath = path.join(dir, fileName);
		const stat = fs.statSync(newPath);

		const newParams = Object.assign({}, params, { dir: newPath });
		if (stat.isDirectory() && !exclude.includes(fileName)) {
			recursiveReplace(newParams);
		} else if (stat.isFile()) {
			replaceContent(newPath, from, to);
		}
	});
}

export function replaceContent(fileUrl: string, from: string, to: string): void {
	const content = fs.readFileSync(fileUrl, 'utf8');
	if (!content.includes(from)) return;
	const newCont = content.replace(new RegExp(from, 'g'), to);

	fs.writeFileSync(fileUrl, newCont);
	log(`Updated ${fileUrl} `);
}
