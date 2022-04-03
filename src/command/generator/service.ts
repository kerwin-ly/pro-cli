import Generator from '../generator';
import { error, log, warn } from '@utils/logger';
import * as fse from 'fs-extra';
import { getPkgJson, install, setPkgJson } from '@utils/package';
import { get } from 'lodash';
import { execSync } from 'child_process';
import * as chalk from 'chalk';
import { yApi } from '@api/yapi';
import { NG_SWAGGER_GEN_VER, NG_GEN_LIBRARY, YAPI_EMAIL, YAPI_PWD } from '@config/constant';
import * as inquirer from 'inquirer';
import { getCurrentPath } from '@utils/path';
import { IYapiSwagger } from '@typings/yapi';

interface Tag {
	name: string;
	description?: string;
}

const prompt = inquirer.createPromptModule();

class ServiceGenerator extends Generator {
	swaggerJson: IYapiSwagger;
	interfaces: string[];
	interfaceName: string;
	isReq = true;
	tag: string;

	constructor() {
		super();
		this.interfaces = [];
		this.interfaceName = '';
		this.swaggerJson = {} as IYapiSwagger;
		this.tag = '';
	}

	async createPrompt(): Promise<void> {
		const reg = /yapi\.company\.com\/project\/(\d+)\/interface\/api/;
		const pkg = getPkgJson();
		const answers = (await prompt([
			{
				type: 'input',
				name: 'address',
				message: 'Input the project address in yApi(e.g. https://yapi.company.com/project/xxx/interface/api)',
				default: get(pkg, 'config.yapi') || null,
				validate: (input: string) => {
					if (!reg.test(input)) {
						return 'Please input the correct api address.(e.g. https://yapi.company.com/project/23/interface/api)';
					}

					return true;
				}
			},
			{
				type: 'input',
				name: 'output',
				message: 'Which path would you like to output',
				default: 'src/api',
				validate: (input: string) => {
					if (!input) {
						return 'Please input the output path';
					}

					return true;
				}
			}
		])) as inquirer.Answers;
		const matches = answers.address.match(reg);

		if (!matches) {
			error('Error: The api address is not correct, please check it ' + answers.address);
			return;
		}
		const projectId = matches[1];

		this.run(projectId, answers);
	}

	getSwaggerJson(swaggerJsonUrl: string) {
		return fse.readJsonSync(swaggerJsonUrl);
	}

	async run(projectId: string, answers: inquirer.Answers) {
		const swaggerAddress = getCurrentPath('./swaggerApi.json');
		await this.downloadSwaggerJson(projectId, swaggerAddress);
		const swaggerJson = this.getSwaggerJson(swaggerAddress);
		if (this.hasChinese(swaggerJson.tags)) {
			error('Error: Tags should be english in yapi');
			return;
		}
		this.installPackages();
		this.generateService(answers.output);
		this.ignoreLint(answers.output);
		this.saveApiAddress(answers.address);
	}

	// 修改项目.eslintignore，忽略对生成代码的校验
	ignoreLint(output: string): void {
		const eslintIgnoreAddr = getCurrentPath('./.eslintignore');
		if (!fse.existsSync(eslintIgnoreAddr)) {
			return;
		}

		const content = fse.readFileSync(eslintIgnoreAddr);
		if (content.includes(output)) {
			return;
		}

		const newContent = content + '\n' + output;
		fse.writeFileSync(eslintIgnoreAddr, newContent);
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
			const user = await yApi.login({ email: YAPI_EMAIL, password: YAPI_PWD });

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
			fse.writeFileSync(localAddress, JSON.stringify(swagger, null, '\t'));
			log(`${chalk.green('✔')}  Successfully created swaggerApi.json in the root directory`);
		} catch (err) {
			throw err;
		}
	}

	installPackages(): void {
		const pkg = getPkgJson();
		const library = pkg['devDependencies']['cli-yapi-gen'];

		if (!library) {
			install({
				devDependencies: [NG_GEN_LIBRARY]
			});
			return;
		}
		const localVersion = library.split('#')[1];
		if (localVersion !== NG_SWAGGER_GEN_VER) {
			warn(
				`The latest version of ng-swaggger-gen is ${chalk.bold.cyan(NG_SWAGGER_GEN_VER)}. Run: ${chalk.cyan(
					`yarn add ${NG_GEN_LIBRARY}`
				)} to upgrade it.`
			);
		}
	}

	generateDefinations(json: IYapiSwagger): void {
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
			execSync(`node_modules/.bin/cli-yapi-gen -i ./swaggerApi.json -o ${output}`, { stdio: 'inherit' });
			log(`${chalk.green('✔')}  Successfully generated api services`);
		} catch (err) {
			throw new Error('Fail to generate service by cli-yapi-gen ' + err);
		}
	}

	saveApiAddress(address: string): void {
		const pkg = getPkgJson();

		if (get(pkg, 'config.yapi')) return;
		pkg.config = Object.assign({}, pkg['config'], {
			yapi: address
		});
		setPkgJson(pkg);
	}
}

export default ServiceGenerator;
