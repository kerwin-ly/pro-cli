import Generator from '../generator';
import { execSync } from 'child_process';
import * as chalk from 'chalk';
import { downloadTmpFromLocal, getDirname, render, cwd } from '../../utils/file';
import { error, log, warn } from '../../utils/logger';
import { install } from '../../utils/packageManager';
import { sentryApi } from '../../api/sentry';
import * as inquirer from 'inquirer';
import { sentryToken } from '../../config/constant';
import * as fs from 'fs-extra';

const prompt = inquirer.createPromptModule();

class SentryGenerator extends Generator {
	constructor() {
		super();
	}

	async createPrompt(): Promise<void> {
		const answers = await prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Input the project name which shows in Sentry',
				default: getDirname,
				validate: (input: string) => {
					if (!input) {
						return 'Please input the project name!';
					}

					return true;
				}
			}
		]);

		this.run(answers);
	}

	async run(answers: inquirer.Answers): Promise<void> {
		this.installSentry();
		this.addSentrySDK(answers.name);
		await this.createSentryProject(answers.name);
		this.importSentry();
		this.addScriptShell();
		log();
		log(`See ${chalk.yellow('http://wiki.company.com/pages/viewpage.action?pageId=3147181')} to get more details`);
	}

	installSentry() {
		try {
			execSync('sentry-cli --version', { stdio: 'ignore' });
		} catch (error) {
			execSync('npm install -g @sentry/cli', { stdio: 'inherit' }); // 如果没有安装sentry/cl，首先全局安装
		}

		!require(cwd() + '/package.json')['dependencies']['@sentry/browser'] &&
			install({
				dependencies: ['@sentry/browser']
			});
	}

	addSentrySDK(projectName: string) {
		try {
			downloadTmpFromLocal('templates/tools/sentry/sentry-upload.sh', `${cwd()}/scripts/sentry-upload.sh`);
			const data = {
				authToken: sentryToken,
				projectName
			};
			render(`${cwd()}/scripts/sentry-upload.sh`, data);
			downloadTmpFromLocal(
				'templates/tools/sentry/sentry.service.ts',
				`${cwd()}/src/app/core/sentry/sentry.service.ts`
			);
			downloadTmpFromLocal('templates/tools/sentry/index.ts', `${cwd()}/src/app/core/sentry/index.ts`);
			log(`${chalk.green('✔')}  Successfully added Sentry SDK`);
		} catch (err) {
			throw new Error('Error: Download template failed ' + err);
		}
	}

	async createSentryProject(name: string): Promise<void> {
		try {
			const project = await sentryApi.createProject({
				name,
				platform: '',
				team: 'poc_frontend'
			});
			log(
				`${chalk.green('✔')}  Successfully created sentry project at ${chalk.yellow(
					'http://starport.company.com/starport/' + project.name + '/'
				)}`
			);
		} catch (err) {
			if (err.detail) {
				error('Sentry api error: ' + err.detail);
				process.exit(1);
			}
			throw err;
		}
	}

	importSentry(): void {
		const sharedPath = cwd() + '/src/app/shared/shared.module.ts';
		const data = fs.readFileSync(sharedPath, 'utf-8').toString();

		if (/SENTRY_PROVIDERS/.test(data)) return;
		const result = data.replace(/providers\:\ \[/i, `providers: [SENTRY_PROVIDERS, `);

		fs.writeFileSync(sharedPath, `import { SENTRY_PROVIDERS } from '@core/sentry';\n${result}`);
		log(`${chalk.green('✔')}  Successfully imported Sentry`);
	}

	addScriptShell(): void {
		const json = require(cwd() + '/package.json');

		json['scripts']['sentry'] =
			'npm run color-less && node --max_old_space_size=8192 node_modules/@angular/cli/bin/ng build --prod --source-map=true && sh scripts/sentry-upload.sh';
		fs.writeFileSync(cwd() + '/package.json', JSON.stringify(json, null, '\t'));
		log();
		log('👉  To release a new package, in one tab, run:');
		log(`$ ${chalk.cyan('npm run sentry')}`);
	}
}

export default SentryGenerator;
