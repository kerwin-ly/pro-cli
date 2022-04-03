import { gitlabApi } from '@api/gitlab';
import { GITLAB_REPO_ID, GITLAB_USER_ID } from '@config/constant';
import { execSync } from 'child_process';
import { throwGitlabError, log } from '@utils/logger';
import chalk = require('chalk');
import { getCliPkgJson } from '@utils/package';

class Upgrader {
	constructor() {}

	async upgrade(version?: string): Promise<void> {
		const tagList = await this.getTagList();

		if (version) {
			this.upgradeToTarget(tagList, version);
			return;
		}
		this.upgradeToLatest(tagList[0]);
	}

	/**
	 * get pro-cli released tags
	 * @returns {Promise<string[]>}
	 * @memberof Upgrader
	 */
	async getTagList(): Promise<string[]> {
		try {
			const tags = await gitlabApi.getTags({
				projectId: GITLAB_REPO_ID,
				id: GITLAB_USER_ID,
				order_by: 'updated'
			});
			return tags.map((item) => item.name);
		} catch (err) {
			throwGitlabError(err);
			process.exit(1);
		}
	}

	upgradeToTarget(tagList: string[], version: string): void {
		if (!tagList.includes(version)) {
			log(
				`The version does not exist, you can see ${chalk.yellow(
					'https://git.company.com/frontend_utils/pro-cli/tags'
				)} to get released tags`
			);
			return;
		}
		this.installPkg(version);
	}

	upgradeToLatest(latestVersion: string): void {
		const pkg = getCliPkgJson();
		const installed = pkg.version;

		if (installed === latestVersion) {
			log(`You have installed the latest version ${installed}`);
			return;
		}
		this.installPkg(latestVersion);
	}

	installPkg(tag: string): void {
		execSync(`npm install -g pro-cli@git+ssh://git@git.company.com:58422/frontend_utils/pro-cli.git#${tag}`, {
			stdio: 'inherit'
		});
	}
}

export default Upgrader;
