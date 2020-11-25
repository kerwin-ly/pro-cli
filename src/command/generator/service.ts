import Generator from '../generator';
import { error, log } from '../../utils/logger';
import * as fs from 'fs-extra';
import { install } from '../../utils/packageManager';
import { get } from 'lodash';
import { execSync } from 'child_process';
import * as chalk from 'chalk';
import { yApi } from '../../api/yapi';
import { yapi as yapiConfig } from '../../config/constant';
import { Swagger } from '../../interface/yapi-interface';
import * as inquirer from 'inquirer';
import { cwd } from 'process';

interface Tag {
	name: string;
	description?: string;
}

const prompt = inquirer.createPromptModule();

class ServiceGenerator extends Generator {
	swaggerJson: Swagger;
	interfaces: string[];
	interfaceName: string;
	isReq = true;
	tag: string;

	constructor() {
		super();
		this.interfaces = [];
		this.interfaceName = '';
		this.swaggerJson = {} as Swagger;
		this.tag = '';
	}

	async createPrompt(): Promise<void> {
		const reg = /http\:\/\/yapi\.company\.com\/project\/(\d+)\/interface\/api/;
		const answers = await prompt([
			{
				type: 'input',
				name: 'address',
				message: 'Input the project address in yApi(e.g. http://yapi.company.com/project/xxx/interface/api)',
				default: get(require(cwd() + '/package.json'), 'config.yapi') || null,
				validate: (input: string) => {
					if (!reg.test(input)) {
						return 'Please input the correct api address.(e.g. http://yapi.company.com/project/23/interface/api)';
					}

					return true;
				}
			},
			{
				type: 'input',
				name: 'output',
				message: 'Which path would you like to output',
				default: 'src/app/api',
				validate: (input: string) => {
					if (!input) {
						return 'Please input the output path';
					}

					return true;
				}
			}
		]);
		const matches = answers.address.match(reg);

		if (!matches) {
			error('Error: The api address is not correct, please check it ' + answers.address);
			return;
		}
		const projectId = matches[1];

		this.run(projectId, answers);
	}

	async run(projectId: string, answers: inquirer.Answers) {
		const swaggerAddress = cwd() + '/swaggerApi.json';
		await this.downloadSwaggerJson(projectId, swaggerAddress);
		const swaggerJson = require(swaggerAddress);

		if (this.hasChinese(swaggerJson.tags)) {
			error('Error: Tags should be english in yapi');
			return;
		}
		this.installPackages();
		this.generateService(answers.output);
		this.importApiModule();
		this.saveApiAddress(answers.address);
	}

	/**
	 * tag如果含有中文，无法生成service
	 * @param {Tag[]} tags
	 * @returns {boolean}
	 * @memberof ServiceGenerator
	 */
	hasChinese(tags: Tag[]): boolean {
		const str = tags.reduce((total: string, item: Tag) => (total += item.name), '');
		const reg = /.*[\u4e00-\u9fa5]+.*$/i;

		return reg.test(str);
	}

	async downloadSwaggerJson(projectId: string, localAddress: string): Promise<void> {
		try {
			const user = await yApi.login({ email: yapiConfig.email, password: yapiConfig.password });

			if (user.errcode && user.errcode !== 0) {
				error('Error: ' + user.errmsg);
				process.exit(1);
			}
			const swagger = await yApi.getSwaggerJson({
				type: 'OpenAPIV2',
				pid: Number(projectId),
				status: 'all',
				isWiki: false
			});

			if (swagger.errcode && swagger.errcode !== 0) {
				if (swagger.errcode === 502) {
					error(`Error: You have no permission to download swaggerApi.json`);
				} else {
					error('Error: ' + swagger.errmsg);
				}
				process.exit(1);
			}
			fs.writeFileSync(localAddress, JSON.stringify(swagger, null, '\t'));
			log(`${chalk.green('✔')}  Successfully created swaggerApi.json in the root directory`);
		} catch (err) {
			throw err;
		}
	}

	installPackages(): void {
		const packageJson = require(cwd() + '/package.json');

		if (packageJson['devDependencies']['ng-swagger-gen']) return;
		install({
			devDependencies: ['ng-swagger-gen@git+ssh://git@git.company.com:58422/liyi/ng-swagger-gen.git#0.1.3']
		});
	}

	generateDefinations(json: Swagger): void {
		const tags = json.tags;
		const definition = {} as any;

		for (let i = 0; i < tags.length; i++) {
			const name = tags[i].name;

			!definition[name] && (definition[name] = {});
		}
		return definition;
	}

	toUpper(name: string): string {
		const reg = /\{.*?\}|:/g;
		const filterName = name.replace(reg, '');
		const list = filterName.split('/');

		return list.reduce((item, key) => (item += key.slice(0, 1).toUpperCase() + key.slice(1)), '');
	}

	generateService(output: string): void {
		try {
			execSync(`node_modules/.bin/ng-swagger-gen -i ./swaggerApi.json -o ${output}`, { stdio: 'inherit' });
			log(`${chalk.green('✔')}  Successfully generated api services`);
		} catch (err) {
			throw new Error('Fail to generate service by ng-swagger-gen ' + err);
		}
	}

	importApiModule(): void {
		try {
			const appPath = cwd() + '/src/app/app.module.ts';
			const data = fs.readFileSync(appPath, 'utf-8').toString();

			if (/ApiModule\.forRoot/.test(data)) return;
			const result = data.replace(/(imports\:\ \[)/i, `imports: [\n ApiModule.forRoot({ rootUrl: '.' }),`);

			fs.writeFileSync(appPath, `import { ApiModule } from './api/api.module';\n${result}`);
			log(`${chalk.green('✔')}  Successfully imported apiModule.ts in app.module.ts`);
		} catch (err) {
			throw new Error('Fail to import apiModule.ts ' + err);
		}
	}

	saveApiAddress(address: string): void {
		const json = require(cwd() + '/package.json');

		if (json['config']['yapi']) return;
		json['config'] = Object.assign({}, json['config'], {
			yapi: address
		});

		fs.writeFileSync(cwd() + '/package.json', JSON.stringify(json, null, '\t'));
	}
}

export default ServiceGenerator;
