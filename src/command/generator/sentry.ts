import Generator from '../generator';
import * as chalk from 'chalk';
import { error, log } from '@utils/logger';
import { sentryApi } from '@api/sentry';
import * as inquirer from 'inquirer';
import { SENTRY_TOKEN, FRONTEND_GROUP } from '@config/constant';
import { getDirname, cwd } from '@utils/path';
import { registerToNgModule } from '@utils/ast';
import { renderSentryTmp, installSentry } from '@utils/sentry';

const prompt = inquirer.createPromptModule();
const wikiDetailLink = 'http://wiki.company.com/pages/viewpage.action?pageId=3147181';
const sentryLink = 'http://starport.company.com/starport/';

class SentryGenerator extends Generator {
	constructor() {
		super();
	}

	async createPrompt(): Promise<void> {
		const answers = (await prompt([
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
		])) as inquirer.Answers;

		this.run(answers);
	}

	async run(answers: inquirer.Answers): Promise<void> {
		installSentry();
		this.addSentrySDK(answers.name);
		await this.createSentryProject(answers.name);
		this.importSentry();
		log();
		log(`See ${wikiDetailLink} to get more details`);
	}

	addSentrySDK(projectName: string): void {
		const data = {
			authToken: SENTRY_TOKEN,
			projectName
		};
		renderSentryTmp(data);
		log(`${chalk.green('✔')}  Successfully added Sentry SDK`);
	}

	async createSentryProject(name: string): Promise<void> {
		try {
			const project = await sentryApi.createProject({
				name,
				platform: '',
				team: FRONTEND_GROUP
			});
			log(
				`${chalk.green('✔')}  Successfully created sentry project at ${chalk.yellow(sentryLink + project.name + '/')}`
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
		const targetFile = cwd() + '/src/app/app.module.ts';

		registerToNgModule(targetFile, {
			moduleName: 'SENTRY_PROVIDERS',
			modulePath: '@core/sentry',
			propertyKey: 'providers',
			propertyValue: 'SENTRY_PROVIDERS',
			importType: 'ImportDefaultSpecifier'
		});
		log(`${chalk.green('✔')}  Successfully imported Sentry`);
	}
}

export default SentryGenerator;
