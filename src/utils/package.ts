import { execSync } from 'child_process';
import { error, log, warn } from './logger';
import * as chalk from 'chalk';
import { reduce } from 'lodash';
import * as fse from 'fs-extra';
import * as semver from 'semver';
import { getCurrentPath } from './path';
import * as path from 'path';
import { Dependencies, ISafeAny } from '@typings/common';

export function checkNodeVersion(wanted: string, id: string) {
	if (!semver.satisfies(process.version, wanted, { includePrerelease: true })) {
		console.log(
			chalk.red(
				'You are using Node ' +
					process.version +
					', but this version of ' +
					id +
					' requires Node ' +
					wanted +
					'.\nPlease make sure your Node version is matched.'
			)
		);
		process.exit(1);
	}
}

export function install(dep: Dependencies): void {
	if (!hasYarn()) return;

	try {
		let packageValue = '';
		const dependenciesLine =
			dep['dependencies'] &&
			reduce(dep['dependencies'], (line: string, name: string) => (line += ` ${name}`), 'yarn add');
		const devDependenciesLine =
			dep['devDependencies'] &&
			reduce(dep['devDependencies'], (line: string, name: string) => (line += ` ${name}`), 'yarn add --dev');

		if (dependenciesLine && devDependenciesLine) {
			packageValue = `${dependenciesLine} && ${devDependenciesLine}`;
		} else if (!dependenciesLine && devDependenciesLine) {
			packageValue = devDependenciesLine;
		} else if (dependenciesLine && !devDependenciesLine) {
			packageValue = dependenciesLine;
		} else {
			warn('Warn: No packages to install');
			return;
		}

		log(`📦  Installing additional dependencies...`);
		packageValue && execSync(packageValue, { stdio: 'inherit' });
	} catch (err) {
		throw new Error('Fail to install dependencies ' + err);
	}
}

function hasYarn(): boolean {
	try {
		execSync('yarn --version', { stdio: 'ignore' });
		return true;
	} catch (err) {
		error(`Error: cannot init yarn, run ${chalk.cyan('brew install yarn')} to install it.`);
		return false;
	}
}

export function readJsonSync(jsonUrl: string) {
	try {
		return fse.readJsonSync(jsonUrl);
	} catch (err) {
		error(`Error: Fail to read ${jsonUrl}` + err);
	}
}

export function writeJsonSync(jsonUrl: string, json: object): void {
	try {
		fse.writeFileSync(jsonUrl, JSON.stringify(json, null, '\t'));
	} catch (err) {
		error(`Error: Fail to write ${jsonUrl}` + err);
	}
}

export function getPkgJson() {
	const pkgPath = getCurrentPath('./package.json');
	return fse.readJsonSync(pkgPath);
}

export function getCliPkgJson() {
	const pkgPath = path.resolve(__dirname, '../package.json');
	return fse.readJsonSync(pkgPath);
}

export function setPkgJson(content: ISafeAny) {
	const pkgPath = getCurrentPath('./package.json');
	fse.writeJSONSync(pkgPath, content, {
		spaces: '\t'
	});
}
