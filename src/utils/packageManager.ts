import { Dependencies } from '../interface/common';
import { execSync } from 'child_process';
import { error, log, warn } from './logger';
import * as chalk from 'chalk';
import { reduce } from 'lodash';

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
