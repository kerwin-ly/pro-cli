import * as fs from 'fs-extra';
import * as path from 'path';
import { sonarTemplate } from '@config/template';
import { render } from './handlebars';
import { getCurrentPath } from './path';
import { hasGitlabYmlSync, getGitlabYmlSync } from './git';

export function getSonarYmlSync(): string {
	const sonarYmlPath = path.resolve(__dirname, sonarTemplate.yml.from);
	render(sonarYmlPath, null);
	return fs.readFileSync(sonarYmlPath, 'utf-8');
}

export function rewriteGitlabConf() {
	const gitlabYmlPath = getCurrentPath('./.gitlab-ci.yml');
	if (!hasGitlabYmlSync(gitlabYmlPath)) {
		throw new Error('Cannot find file .gitlab-ci.yml, please make sure you have configured CI/CD');
	}
	const sonarYml = getSonarYmlSync();
	const gitlabYml = getGitlabYmlSync(gitlabYmlPath);

	fs.writeFileSync(gitlabYmlPath, gitlabYml + sonarYml, 'utf8');
}

export function renderSonarShell(name: string): void {
	const from = path.resolve(__dirname, sonarTemplate.shell.from);
	const to = getCurrentPath(sonarTemplate.shell.to);
	const data = { name };
	render(from, data, to);
}
