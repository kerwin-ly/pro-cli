import * as inquirer from 'inquirer';
import { initQuestions } from '@config/question';
import * as ora from 'ora';
import { TEMPLATE_ADDRESS, REPOSITORY, FRONTEND_REPO, CLI_TEMPLATE_VER } from '@config/constant';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as program from 'commander';
import { log, error } from '@utils/logger';
import { IGitlabProject } from '@typings/gitlab';
import GitGenerator from './generator/git';
import { GeneratorFactory } from './generator/genetatorFactory';
import SonarGenerator from './generator/sonar';
import { cwd, getCurrentPath, moveNodeExecEnv } from '@utils/path';
import { renameRepository, removeSync } from '@utils/file';
import { createVariables, formatDockerPwd, formatDockerUser, renderBuildShellTemp, renderCiTmp } from '@utils/git';
import { render } from '@utils/handlebars';
import { commitlintTemplate } from '@config/template';
import { Package } from '@typings/common';

const downloadProcess = ora('Downloading template...');
const modifyProcess = ora('Updating template...');

export default class Creator {
	name: string;
	cmd: program.Command;
	static detail: IGitlabProject;

	constructor(name: string, cmd: program.Command) {
		this.name = name;
		this.cmd = cmd;
	}

	async create(): Promise<void> {
		const questionList = initQuestions(this.name);

		inquirer.prompt<inquirer.Answers>(questionList).then(async (answers) => {
			if (!this.canDownload(answers.name)) return;
			this.downloadTemplate();
			this.updateTemplate(answers);
			this.removeGitSync();
			renameRepository(answers.name);
			moveNodeExecEnv(cwd() + `/${answers.name}`);
			answers['initGit'] && (await this.initGit(answers.name));
			answers['sonarProjectName'] && (await this.initSonar(answers.sonarProjectName));

			log();
			log(`🎉  Successfully created project ${chalk.yellow(answers.name)}.`);
			answers['initGit'] && log(`For more details, visit ${chalk.yellow(Creator.detail.http_url_to_repo)} `);
			log();
			log('👉  To get started, in one tab, run:');
			log(`$ ${chalk.cyan(`cd ${answers.name} && yarn && yarn dev`)}`);
			log();
		});
	}

	canDownload(name: string): boolean {
		const fileUrl = cwd() + `/${name}`;

		if (!fs.existsSync(fileUrl)) {
			return true;
		}

		if (this.cmd.force) {
			removeSync(fileUrl);
			return true;
		} else {
			error('Error: The directory already exists, please remove it and try again.');
			return false;
		}
	}

	downloadTemplate(): void {
		downloadProcess.start();

		try {
			execSync(`git clone -b ${CLI_TEMPLATE_VER} --depth 1 ${TEMPLATE_ADDRESS}`, { stdio: 'ignore' });
			downloadProcess.succeed('Download template succeed');
		} catch (err) {
			downloadProcess.fail('Download template failed');
			throw err;
		}
	}

	removeGitSync(): void {
		removeSync(path.join(process.cwd(), `/${REPOSITORY}/.git`));
	}

	updateTemplate(answers: inquirer.Answers): void {
		const { name, description, commitlint, continuous, dockerRepositoryUrl } = answers;

		modifyProcess.start();
		try {
			const pkg = cwd() + `/${REPOSITORY}/package.json`;
			const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));

			content.name = name;
			content.description = description;
			if (commitlint) {
				this.addCommitlintDep(content);
				this.renderCommitlintTemp();
			}
			// CI/CD config
			continuous && this.addContinuousTool(dockerRepositoryUrl, name);

			fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
			modifyProcess.succeed('Update template succeed');
		} catch (err) {
			modifyProcess.fail('Update template failed');
			throw err;
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
			error('Error: Cannot get Docker address to login');
			process.exit(1);
		}

		const data = {
			dockerRepositoryUrl,
			dockerLoginUrl,
			dockerUser: formatDockerUser(projectName),
			dockerPassword: formatDockerPwd(projectName),
			gitRepositoryUrl: `${FRONTEND_REPO}/${projectName}.git`,
			projectName
		};

		renderCiTmp(data);
		renderBuildShellTemp({ dockerRepositoryUrl });
	}

	addCommitlintDep(content: Package): void {
		content['devDependencies']['@commitlint/cli'] = '^16.0.2';
		content['devDependencies']['@commitlint/config-conventional'] = '^16.0.0';
	}

	async initGit(projectName: string): Promise<void> {
		const connector = GeneratorFactory.getInstance('git') as GitGenerator;
		const project = await connector.initGit(projectName);

		await createVariables(project);
		Creator.detail = project;
	}

	async initSonar(name: string): Promise<void> {
		const sonar = GeneratorFactory.getInstance('sonar') as SonarGenerator;
		await sonar.run(name);
	}

	renderCommitlintTemp(): void {
		render(path.resolve(__dirname, commitlintTemplate.config.from), null, getCurrentPath(commitlintTemplate.config.to));
	}
}
