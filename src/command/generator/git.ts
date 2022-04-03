import * as inquirer from 'inquirer';
import { get } from 'lodash';
import * as chalk from 'chalk';
import * as ora from 'ora';
import Generator from '../generator';
import { error, log, throwGitlabError } from '@utils/logger';
import { gitlabApi } from '@api/gitlab';
import * as fse from 'fs-extra';
import * as path from 'path';
import { IGitlabProject } from '@typings/gitlab';
import { cwd, getCurrentPath, getDirname } from '@utils/path';
import { createVariables, execGitSync, formatDockerPwd, formatDockerUser } from '@utils/git';
import { recursiveReplace, removeSync } from '@utils/file';
import { getPkgJson } from '@utils/package';

const prompt = inquirer.createPromptModule();
const gitProcess = ora('Creating gitlab project...');

class GitGenerator extends Generator {
	constructor() {
		super();
	}

	async createPropmts(): Promise<void> {
		const fileUrl = path.join(cwd(), '/.git');

		if (fse.existsSync(fileUrl)) {
			const answers = await this.replacePrompt();
			if (!answers.isReplace) return;
			removeSync(fileUrl);
		}

		const data = await this.namePrompt();
		this.updateRepo(data.projectName);
		this.updateDockerInfo(data.projectName);
		const project = await this.initGit(data.projectName, false);

		await createVariables(project);

		log();
		log(`${chalk.green('✔')}  Successfully created project in Gitlab`);
		log(`For more details, visit ${chalk.yellow(project.http_url_to_repo)} `);
	}

	updateDockerInfo(projectName: string): void {
		try {
			const fileUrl = getCurrentPath('./.gitlab-ci.yml');
			if (!fse.existsSync(fileUrl)) return;
			const content = fse.readFileSync(fileUrl).toString();
			const matches = content.match(/(?<=(\-u\s)|(\-p\s))(.*?)(?=\s)/g); // 提取.gitlab-ci.yml中的docker账号，密码
			const newCont = content
				.replace(matches![0], '$' + formatDockerUser(projectName))
				.replace(matches![1], '$' + formatDockerPwd(projectName));

			fse.writeFileSync(fileUrl, newCont);
			log(`Updated CI/CD variables in ${fileUrl}`);
		} catch (err) {
			error('Error: Fail to replace docker user in .gitlab-ci.yml' + err);
		}
	}

	updateRepo(target: string): void {
		const pkg = getPkgJson();
		const source = pkg.name;

		recursiveReplace({
			dir: cwd(),
			from: source,
			to: target,
			exclude: ['node_modules', '.git']
		});
	}

	async replacePrompt(): Promise<{ isReplace: boolean }> {
		return prompt([
			{
				type: 'confirm',
				name: 'isReplace',
				message: '.git repository already exists, would you like to replace it?',
				default: false
			}
		]);
	}

	async namePrompt(): Promise<{ projectName: string }> {
		return prompt([
			{
				type: 'input',
				name: 'projectName',
				message: 'Input your gitlab repository name',
				default: getDirname(),
				validate: (input: string) => {
					if (input) {
						return true;
					}

					return 'Please input your gitlab repository name';
				}
			}
		]);
	}

	async initGit(name: string, isReset = true): Promise<IGitlabProject> {
		gitProcess.start();
		try {
			const groups = await gitlabApi.getGroups({ owned: true });
			const data = await gitlabApi.create({
				name: name,
				namespace_id: get(groups, '0.id')
			});
			execGitSync(data.ssh_url_to_repo);
			gitProcess.stop();

			return data;
		} catch (err) {
			throwGitlabError(err);
			isReset && removeSync(cwd());
			gitProcess.stop();
			process.exit(1);
		}
	}
}

export default GitGenerator;
