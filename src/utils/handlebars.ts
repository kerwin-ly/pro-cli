import * as fs from 'fs';
import * as handlebars from 'handlebars';

/**
 * handlebars render
 * @param source
 * @param data
 * @param target
 */
export function render(source: string, data: any, target?: string): void {
	try {
		const content = fs.readFileSync(source, 'utf-8');
		const result = handlebars.compile(content)(data);

		fs.writeFileSync(target || source, result, 'utf-8');
	} catch (err) {
		throw new Error('Fail to compile template ' + err);
	}
}
