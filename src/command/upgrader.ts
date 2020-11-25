import * as path from 'path';
import { gitlabApi } from '../api/gitlab';
import { cliRepo } from '../config/constant';
import { execSync } from 'child_process';
import { throwGitlabError, log, error } from '../utils/logger';
import chalk = require('chalk');

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
	 * get dg-cli released tags
	 * @returns {Promise<string[]>}
	 * @memberof Upgrader
	 */
	async getTagList(): Promise<string[]> {
		try {
			const tags = await gitlabApi.getTags({
				projectId: cliRepo.projectId,
				id: cliRepo.userId,
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
					'https://git.company.com/web/dg-cli/tags'
				)} to get released tags`
			);
			return;
		}
		this.installPkg(version);
	}

	upgradeToLatest(latestVersion: string): void {
		const packageJson = require(path.join(__dirname, '../../package.json'));
		const installed = packageJson.version;

		if (installed === latestVersion) {
			log(`You have installed the latest version ${installed}`);
			return;
		}
		this.installPkg(latestVersion);
	}

	installPkg(tag: string): void {
		execSync(`npm install -g dg-cli@git+ssh://git@git.company.com:58422/web/dg-cli.git#${tag}`, {
			stdio: 'inherit'
		});
	}
}

export default Upgrader;
