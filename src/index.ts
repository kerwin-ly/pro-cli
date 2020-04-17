import * as inquirer from 'inquirer';
import * as path from 'path';
import { questionList } from './config/question';
import * as ora from 'ora';
import { templateUrl, repository } from './config/constant';
import { exec, execSync } from 'child_process';
import * as fs from 'fs';
import { get } from 'lodash';
import * as chalk from 'chalk';

const downloadProcess = ora('Download template...');
const modifyProcess = ora('Update template...');

interface Package {
  name: string;
  version: string;
  description: string;
  [props: string]: any;
}

export default class Creator {
  constructor() {}

  init(): void {
    inquirer.prompt<inquirer.Answers>(questionList).then((answers) => {
      // check if the repository existed
      if (fs.existsSync(process.cwd() + `/${repository}`) || fs.existsSync(process.cwd() + `/${answers['name']}`)) {
        console.log(chalk.red('Error: The directory is existed, please remove it and try again.'));
        return;
      }
      this.downloadTemplate(answers);

      // this.addContinuousTool(answers.dockerRepositoryUrl, answers.gitRepositoryUrl);
    });
  }

  /**
   * Download repository template
   * @param {inquirer.Answers} answers
   * @memberof Creator
   */
  downloadTemplate(answers: inquirer.Answers): void {
    downloadProcess.start();
    exec(`git clone ${templateUrl}`, (err) => {
      if (err) {
        downloadProcess.fail('Download template failed');
        throw err;
      }

      downloadProcess.succeed('Download template succeed');
      this.updatePackage(answers);
      this.remove(process.cwd() + `/${repository}/.git`);
      this.renameRepository(answers['name']);
    });
  }

  /**
   * Update repository name
   * @param {string} name
   * @memberof Creator
   */
  renameRepository(name: string): void {
    try {
      fs.renameSync(path.join(__dirname, `../${repository}`), path.join(__dirname, `../${name}`));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update dependencies
   * @param {inquirer.Answers} answers
   * @memberof Creator
   */
  updatePackage(answers: inquirer.Answers): void {
    const { name, description, commitlint, continuous } = answers;
    modifyProcess.start();

    try {
      const pkg = process.cwd() + `/${repository}/package.json`;
      const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));

      content.name = name;
      content.description = description;

      // commitlint config
      commitlint ? this.addCommitlint(content) : this.remove(process.cwd() + `/${repository}/commitlint.config.js`);

      // CI/CD config
      continuous
        ? this.addContinuousTool(answers.dockerRepositoryUrl, answers.gitRepositoryUrl)
        : this.remove(process.cwd() + `/${repository}/build`);

      fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
      modifyProcess.succeed('Update template succeed');
    } catch (error) {
      modifyProcess.fail('Update template failed');
      throw error;
    }
  }

  /**
   * add CI/CD tool
   * @memberof Creator
   */
  addContinuousTool(dockerRepositoryUrl: string, gitRepositoryUrl: string): void {
    const filePath = process.cwd() + `/${repository}/.gitlab-ci.yml`;
    const fileReadStream = fs.createReadStream(filePath + '.template');
    const fileWriteStream = fs.createWriteStream(filePath);
    const projectName = get(gitRepositoryUrl.match(/\w*\/(\w*)\.git/), '1');

    console.log(dockerRepositoryUrl, gitRepositoryUrl);
    fileReadStream.on('data', (data: string | Buffer) => {
      let line = data.toString();

      // update docker image address in ci-template
      if (line.includes('<DOCKER_IMAGES_ADDRESS>')) {
        line.replace(/<DOCKER_IMAGES_ADDRESS>/, dockerRepositoryUrl);
      }

      // update git address in ci-template
      if (line.includes('<GIT_PROJECT_ADDRESS>')) {
        line.replace(/<GIT_PROJECT_ADDRESS>/, gitRepositoryUrl);
      }

      // update project name in ci-template
      if (line.includes('<GIT_PROJECT_NAME>')) {
        line.replace(/<GIT_PROJECT_NAME>/, projectName);
      }

      fileWriteStream.write(line);
    });

    fileReadStream.on('end', () => {
      console.log('end');
      fileWriteStream.end();
      execSync(`rm -rf ${filePath}.template`);
    });
  }

  /**
   * add commitlint dependencies
   * @param {*} content
   * @memberof Creator
   */
  addCommitlint(content: Package): void {
    content['devDependencies']['@commitlint/cli'] = '^8.2.0';
    content['devDependencies']['@commitlint/config-angular'] = '^8.2.0';
    content['dependencies']['husky'] = '^3.1.0';
    content['dependencies']['lint-staged'] = '^8.2.1';
    content.husky.hooks['commit-msg'] = 'commitlint -E HUSKY_GIT_PARAMS';
  }

  /**
   * remove extra file or directory
   * @param {string} path
   * @memberof Creator
   */
  remove(path: string): void {
    execSync(`rm -rf ${path}`);
  }
}
