import * as fs from 'fs-extra';
import { getCurrentPath } from './path';
import { DOCKER_PWD, DOCKER_USER } from '@config/constant';
import { execSync } from 'child_process';
import { IGitlabProject } from '@typings/gitlab';
import { gitlabApi } from '@api/gitlab';
import { throwGitlabError } from './logger';
import { render } from './handlebars';
import * as path from 'path';
import { dockerTemplateUrl, gitTemplate } from '@config/template';
import { forEach } from 'lodash';
import { ISafeAny } from '@typings/common';

interface IGitlabCiVariables {
	dockerRepositoryUrl: string;
	dockerLoginUrl: string;
	dockerUser: string;
	dockerPassword: string;
	gitRepositoryUrl: string;
	projectName: string;
}

export function hasGitlabYmlSync(gitlabYmlPath: string): boolean {
	return fs.existsSync(gitlabYmlPath);
}

export function getGitlabYmlSync(gitlabYmlPath: string): string {
	const fileResult = fs.readFileSync(gitlabYmlPath, 'utf8');
	return fileResult.replace(/stages:/, 'stages:\n  - sonar');
}

export function execGitSync(repo: string): void {
	execSync('git init');
	execSync('git add .');
	execSync('git commit -m "chore(*): init project"');
	execSync(`git remote add origin ${repo}`);
	execSync('git push -u origin master', { stdio: 'ignore' });
}

export function formatDockerUser(name: string): string {
	return name.toUpperCase() + '_USER';
}

export function formatDockerPwd(name: string): string {
	return name.toUpperCase() + '_PWD';
}

export async function createVariables(project: IGitlabProject): Promise<void> {
	try {
		gitlabApi.createVariables({
			id: project.id,
			key: formatDockerUser(project.name),
			value: DOCKER_USER
		});
		gitlabApi.createVariables({ id: project.id, key: formatDockerPwd(project.name), value: DOCKER_PWD });
	} catch (err) {
		throwGitlabError(err as ISafeAny);
		process.exit(1);
	}
}

export function renderCiTmp(data: IGitlabCiVariables): void {
	render(path.resolve(__dirname, gitTemplate.gitlabCI.from), data, getCurrentPath(gitTemplate.gitlabCI.to));
}

export function renderBuildShellTemp(data: { dockerRepositoryUrl: string }): void {
	const templateNames = fs.readdirSync(path.resolve(__dirname, dockerTemplateUrl.from));

	forEach(templateNames, (templateName: string) => {
		console.log(`render template ${templateName}`);
		const fileName = templateName.split('.hbs')[0];
		render(
			path.resolve(__dirname, `${dockerTemplateUrl.from}${templateName}`),
			data,
			getCurrentPath(`${dockerTemplateUrl.to}${fileName}`)
		);
	});
}
