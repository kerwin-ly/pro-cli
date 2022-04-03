import * as path from 'path';
import { last } from 'lodash';

export function cwd(): string {
	const reg = /(\!|\"|\$|\&|\'|\(|\)|\*|\,|\:|\;|\<|\=|\>|\?|\@|\[|\\|\]|\^|\`|\{|\||\})+/g; // 路径特殊字符转义

	return process.cwd().replace(reg, `\$&`);
}

export function getCurrentPath(relativePath: string): string {
	return path.resolve(process.cwd(), relativePath);
}

export function getDirname(): string {
	return last(cwd().split('/')) as string;
}

export function moveNodeExecEnv(newPath: string): void {
	process.chdir(newPath); // 将node执行目录转移至对应目录
}
