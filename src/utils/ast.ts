import * as fs from 'fs-extra';
import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
import { error } from './logger';
import { ISafeAny } from '@typings/common';

interface RegisterModuleOption {
	modulePath: string;
	moduleName: string;
	propertyKey: string;
	propertyValue: ISafeAny;
	importType: 'ImportDefaultSpecifier' | 'ImportSpecifier';
	importAs?: string;
}

export function registerToNgModule(targetFile: string, option: RegisterModuleOption): void {
	const file = fs.readFileSync(targetFile).toString();
	const ast = parse(file, {
		sourceType: 'module',
		plugins: ['decorators-legacy', 'typescript'] // 如果待代码中有装饰器，需要添加该plugin，才能识别。
	});
	let hasPropertyKey = false;
	const importKey = getImportKey(option);

	try {
		traverse(ast, {
			ClassDeclaration(path: ISafeAny) {
				const node = t.importDeclaration([importKey], t.stringLiteral(option.modulePath));
				path.insertBefore(node);
			},
			ObjectProperty(path: ISafeAny) {
				if (path.node.key.name === option.propertyKey) {
					hasPropertyKey = true;
					path.node.value.elements.push(t.identifier(option.propertyValue));
					path.stop();
				}

				if (!hasPropertyKey && inDecorator(path) && isEnd(path.getAllNextSiblings())) {
					throw new Error(`cannot find key '${option.propertyKey}'`);
				}
			}
		});
	} catch (err) {
		error('Fail to register module ' + err);
	}

	fs.writeFileSync(targetFile, generate(ast, { decoratorsBeforeExport: true }).code);
}

/**
 * 判断是否是在@NgModule里面的对象
 * @param {*} path
 * @returns {boolean}
 */
function inDecorator(path: ISafeAny): boolean {
	return !!path.findParent((path: ISafeAny) => path.isDecorator());
}

function getImportKey(option: RegisterModuleOption) {
	if (option.importType === 'ImportDefaultSpecifier') {
		return t.importDefaultSpecifier(t.identifier(option.moduleName));
	} else {
		return t.importSpecifier(t.identifier(option.moduleName), t.identifier(option.importAs || option.moduleName));
	}
}

function isEnd(nodes: ISafeAny) {
	return !nodes.some((item: ISafeAny) => item.node.type === 'ObjectProperty');
}
