import * as chalk from 'chalk';
import { reduce } from 'lodash';

interface SonarError {
  errors: { msg: string }[];
}

interface GitlabError {
  message: {
    name: string[];
    path: string[];
    limit_reached: string[];
  };
}

export const log = (msg = '') => {
  console.log(msg);
};

export const warn = (msg: string) => {
  console.warn(chalk.yellow(msg));
};

export const error = (msg: string) => {
  log();
  console.error(chalk.red(msg));
};

export const throwSonarError = (err: SonarError) => {
  log();
  console.error(
    chalk.red(
      'Error: Sonar api responsed ' + reduce(err.errors, (result: string, item) => (result += `${item.msg}; `), '')
    )
  );
};

export const throwGitlabError = (err: GitlabError) => {
  log();
  console.error(
    chalk.red(
      'Error: Gitlab api responsed ' +
        reduce(err.message.name, (result: string, msg: string) => (result += `${msg}; `), '')
    )
  );
};
