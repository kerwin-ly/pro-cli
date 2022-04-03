import Generator from '../generator';
import { throwSonarError, log } from '@utils/logger';
import { sonarApi } from '@api/sonar';
import * as inquirer from 'inquirer';
import * as chalk from 'chalk';
import { getDirname } from '@utils/path';
import { renderSonarShell, rewriteGitlabConf } from '@utils/sonar';

const prompt = inquirer.createPromptModule();
const SONAR_QUBE = 'http://sonarqube.company.com/dashboard';

class SonarGenerator extends Generator {
	constructor() {
		super();
	}

	async createPrompt(): Promise<void> {
		const answers = await prompt([
			{
				type: 'input',
				name: 'name',
				message: 'Input the project name which shows in sonarqube',
				default: getDirname(),
				validate: (input: string) => {
					if (!input) {
						return 'Please input the project name!';
					}

					return true;
				}
			}
		]);

		this.run(answers.name);
	}

	async run(name: string): Promise<void> {
		rewriteGitlabConf();
		renderSonarShell(name);
		await this.createProject(name);
		log(
			`${chalk.green('✔')}  Successfully add a project in SonarQube, you can see it at ${chalk.yellow(
				`${SONAR_QUBE}?id=${name}`
			)}`
		);
	}

	async createProject(name: string): Promise<void> {
		try {
			await sonarApi.createProject({ name, project: name });
			log(`${chalk.green('✔')}  Successfully created project in sonarqube`);
		} catch (err) {
			throwSonarError(err);
			process.exit(1);
		}
	}
}

export default SonarGenerator;
