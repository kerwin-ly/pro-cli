import Generator from '../generator';
import { downloadTmpFromLocal, getDirname, render, cwd } from '../../utils/file';
import { error, throwSonarError, log } from '../../utils/logger';
import { sonarApi } from '../../api/sonar';
import * as inquirer from 'inquirer';
import * as fs from 'fs-extra';
import * as chalk from 'chalk';

const prompt = inquirer.createPromptModule();

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
		this.rewriteGitlabConf();
		this.addSonarConfig(name);
		await this.createProject(name);
		log(
			`${chalk.green('✔')}  Successfully add a project in SonarQube, you can see it at ${chalk.yellow(
				`http://sonarqube.company.com/dashboard?id=${name}`
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

	addSonarConfig(name: string) {
		try {
			const path = `${cwd()}/docker/build/sonar.sh`;
			downloadTmpFromLocal('templates/tools/sonar/sonar.sh', path);
			const data = {
				name
			};
			render(path, data);
		} catch (err) {
			throw new Error('Fail to download sonar.sh' + err);
		}
	}

	rewriteGitlabConf() {
		try {
			if (!fs.pathExistsSync(`${cwd()}/.gitlab-ci.yml`)) {
				error('Error: Cannot find file .gitlab-ci.yml, please make sure you have configured CI/CD');
				process.exit(1);
			}
			const fileResult = fs.readFileSync(`${cwd()}/.gitlab-ci.yml`, 'utf8');
			const result = fileResult.replace(/stages:/, `stages:\n  - sonar`);

			fs.writeFileSync(`${cwd()}/.gitlab-ci.yml`, result, 'utf8');
			fs.appendFileSync(
				`${cwd()}/.gitlab-ci.yml`,
				`
sonar:
  image: dockerhub.company.com/ci_runner/frontend_web:12.17
  stage: sonar
  script:
    - yarn
    - sh docker/build/sonar.sh
    - cat sonar-project.properties
    - sonar-scanner
  allow_failure: false
  only:
    - develop
    - master`
			);
		} catch (err) {
			throw new Error('Fail to update .gitlab-ci.yml' + err);
		}
	}
}

export default SonarGenerator;
