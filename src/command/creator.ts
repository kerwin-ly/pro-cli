import * as inquirer from 'inquirer';
import { initQuestions } from '../config/question';
import * as ora from 'ora';
import { templateUrl, repository, docker, gitHost } from '../config/constant';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as chalk from 'chalk';
import * as program from 'commander';
import { log, error, throwGitlabError } from '../utils/logger';
import { Project } from '../interface/gitlab-interface';
import { gitlabApi } from '../api/gitlab';
import GitGenerator from './generator/git';
import { GeneratorFactory } from './generator/genetatorFactory';
import { render, cwd } from '../utils/file';
import SonarGenerator from './generator/sonar';

const downloadProcess = ora('Downloading template...');
const modifyProcess = ora('Updating template...');

interface Package {
	name: string;
	version: string;
	description: string;
	[props: string]: any;
}

export default class Creator {
	name: string;
	cmd: program.Command;
	static detail: Project;

	constructor(name: string, cmd: program.Command) {
		this.name = name;
		this.cmd = cmd;
	}

	create(): void {
		const questionList = initQuestions(this.name);
		console.log(questionList);
		inquirer.prompt<inquirer.Answers>(questionList).then((answers) => {
			if (!this.canDownload(answers.name)) return;
			this.downloadTemplate(answers);
		});
	}

	canDownload(name: string): boolean {
		const fileUrl = cwd() + `/${name}`;

		if (!fs.existsSync(fileUrl)) {
			return true;
		}

		if (this.cmd.force) {
			this.remove(fileUrl);
			return true;
		} else {
			error('Error: The directory already exists, please remove it and try again.');
			return false;
		}
	}

	async downloadTemplate(answers: inquirer.Answers): Promise<void> {
		downloadProcess.start();

		try {
			execSync(`git clone -b master ${templateUrl}`, { stdio: 'ignore' });
			downloadProcess.succeed('Download template succeed');
			this.updateTemplate(answers);
			this.removeExtraFiles();
			this.renameRepository(answers['name']);

			process.chdir(cwd() + `/${answers['name']}`); // 将node执行目录转移至下层项目目录
			answers['initGit'] && (await this.initGit(answers['name']));
			answers['sonarProjectName'] && (await this.initSonar(answers['sonarProjectName']));

			log();
			log(`🎉  Successfully created project ${chalk.yellow(answers['name'])}.`);
			answers['initGit'] && log(`For more details, visit ${chalk.yellow(Creator.detail.http_url_to_repo)} `);
			log();
			log('👉  To get started, in one tab, run:');
			log(`$ ${chalk.cyan(`cd ${answers['name']} && yarn && npm start`)}`);
			log();
		} catch (err) {
			downloadProcess.fail('Download template failed');
			throw err;
		}
	}

	removeExtraFiles(): void {
		this.remove(cwd() + `/${repository}/.git`);
	}

	renameRepository(name: string): void {
		try {
			fs.renameSync(cwd() + `/${repository}`, cwd() + `/${name}`);
		} catch (err) {
			throw new Error('Fail to rename project' + err);
		}
	}

	updateTemplate(answers: inquirer.Answers): void {
		const { name, description, commitlint, continuous } = answers;

		modifyProcess.start();
		try {
			const pkg = cwd() + `/${repository}/package.json`;
			const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));

			content.name = name;
			content.description = description;
			// commitlint config
			commitlint ? this.addCommitlint(content) : this.filterFiles('commitlint');
			// CI/CD config
			continuous ? this.addContinuousTool(answers.dockerRepositoryUrl, answers.name) : this.filterFiles('continuous');

			fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
			modifyProcess.succeed('Update template succeed');
		} catch (err) {
			modifyProcess.fail('Update template failed');
			throw err;
		}
	}

	filterFiles(type: string): void {
		switch (type) {
			case 'continuous':
				this.remove(cwd() + `/${repository}/build`);
				break;
			case 'commitlint':
				this.remove(cwd() + `/${repository}/commitlint.config.js`);
				break;
		}
	}

	/**
	 * add CI/CD tool
	 * @param {string} dockerRepositoryUrl
	 * @returns {void}
	 * @memberof Creator
	 */
	addContinuousTool(dockerRepositoryUrl: string, projectName: string): void {
		const dockerLoginUrl = dockerRepositoryUrl.split('/')[0];

		if (!dockerLoginUrl) {
			error('Error: Can not get docker login url');
			process.exit(1);
		}

		const data = {
			dockerRepositoryUrl,
			dockerLoginUrl,
			dockerUser: this.formatDockerUser(projectName),
			dockerPassword: this.formatDockerPwd(projectName),
			gitRepositoryUrl: `${gitHost}/${projectName}.git`,
			projectName
		};
		const filePath = cwd() + `/${repository}/.gitlab-ci.yml`;
		const shellPath = cwd() + `/${repository}/docker/build/local_build.sh`;

		render(filePath, data);
		render(shellPath, { dockerRepositoryUrl });
	}

	addCommitlint(content: Package): void {
		content['devDependencies']['@commitlint/cli'] = '^8.2.0';
		content['devDependencies']['@commitlint/config-conventional'] = '^8.2.0';
		content.husky.hooks['commit-msg'] = 'commitlint -E HUSKY_GIT_PARAMS';
	}

	async initGit(projectName: string): Promise<void> {
		const connector = GeneratorFactory.getInstance('git') as GitGenerator;
		const project = await connector.initGit(projectName);

		this.createVariables(project);
	}

	formatDockerUser(name: string): string {
		return name.toUpperCase() + '_USER';
	}

	formatDockerPwd(name: string): string {
		return name.toUpperCase() + '_PWD';
	}

	async createVariables(project: Project): Promise<void> {
		Creator.detail = project;

		try {
			gitlabApi.createVariables({
				id: project.id,
				key: this.formatDockerUser(project.name),
				value: docker.user
			});
			gitlabApi.createVariables({ id: project.id, key: this.formatDockerPwd(project.name), value: docker.pwd });
		} catch (err) {
			throwGitlabError(err);
			process.exit(1);
		}
	}

	async initSonar(name: string): Promise<void> {
		const sonar = GeneratorFactory.getInstance('sonar') as SonarGenerator;
		await sonar.run(name);
	}

	remove(path: string): void {
		execSync(`rm -rf ${path}`);
	}
}
