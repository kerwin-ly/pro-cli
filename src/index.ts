import * as inquirer from 'inquirer';
import * as path from 'path';
import { questionList } from './config/question';
import * as ora from 'ora';
import { templateUrl, repository } from './config/constant';
import { exec, execSync, ExecException } from 'child_process';
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
      if (fs.existsSync(process.cwd() + `/${repository}`) || fs.existsSync(process.cwd() + `/${answers['name']}`)) {
        console.log(chalk.red('Error: The directory already exists, please remove it and try again.'));
        return;
      }

      this.downloadTemplate(answers);
    });
  }

  downloadTemplate(answers: inquirer.Answers): void {
    downloadProcess.start();
    exec(`git clone ${templateUrl}`, (err: ExecException | null) => {
      if (err) {
        downloadProcess.fail('Download template failed');
        throw err;
      }

      downloadProcess.succeed('Download template succeed');
      this.updatePackage(answers);
      this.removeExtraFiles();
      this.renameRepository(answers['name']);
      console.log(`

Your project has been created successfully.

To get started, in one tab, run:
$ ${chalk.cyan(`cd ${answers['name']} && npm install && npm start`)}

`);
    });
  }

  removeExtraFiles(): void {
    this.remove(process.cwd() + `/${repository}/.git`);
    this.remove(process.cwd() + `/${repository}/.gitlab-ci.yml.template`);
  }

  renameRepository(name: string): void {
    try {
      fs.renameSync(process.cwd() + `/${repository}`, process.cwd() + `/${name}`);
    } catch (error) {
      throw error;
    }
  }

  updatePackage(answers: inquirer.Answers): void {
    const { name, description, commitlint, continuous } = answers;

    modifyProcess.start();
    try {
      const pkg = process.cwd() + `/${repository}/package.json`;
      const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));

      content.name = name;
      content.description = description;
      // commitlint config
      commitlint ? this.addCommitlint(content) : this.filterFiles('commitlint');
      // CI/CD config
      continuous
        ? this.addContinuousTool(
            answers.dockerRepositoryUrl,
            answers.gitRepositoryUrl,
            answers.dockerUser,
            answers.dockerPassword
          )
        : this.filterFiles('continuous');

      fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
      modifyProcess.succeed('Update template succeed');
    } catch (error) {
      modifyProcess.fail('Update template failed');
      throw error;
    }
  }

  filterFiles(type: string): void {
    switch (type) {
      case 'continuous':
        this.remove(process.cwd() + `/${repository}/build`);
        this.remove(process.cwd() + `/${repository}/.gitlab-ci.yml.template`);
        break;
      case 'commitlint':
        this.remove(process.cwd() + `/${repository}/commitlint.config.js`);
        break;
    }
  }

  /**
   * add CI/CD tool
   * @param {string} dockerRepositoryUrl
   * @param {string} gitRepositoryUrl
   * @param {string} dockerUser
   * @param {string} dockerPassword
   * @returns {void}
   * @memberof Creator
   */
  addContinuousTool(
    dockerRepositoryUrl: string,
    gitRepositoryUrl: string,
    dockerUser: string,
    dockerPassword: string
  ): void {
    const filePath = process.cwd() + `/${repository}/.gitlab-ci.yml`;
    const fileReadStream = fs.createReadStream(filePath + '.template');
    const fileWriteStream = fs.createWriteStream(filePath);
    const projectName = get(gitRepositoryUrl.match(/(?<=\/)[^\/]+(?=\.git)/), '0');
    const dockerLoginUrl = get(dockerRepositoryUrl.match(/(https?:\/\/[\w\.]*)\/.*/), 1);

    if (!projectName) {
      console.log(chalk.red('Error: Can not get projec name'));
      return;
    }
    if (!dockerLoginUrl) {
      console.log(chalk.red('Error: Can not get docker login url'));
      return;
    }
    fileReadStream.on('data', (data: string | Buffer) => {
      let line = data.toString();

      // update docker image address in ci-template
      if (line.includes('<DOCKER_IMAGES_ADDRESS>')) {
        line = line.replace(/<DOCKER_IMAGES_ADDRESS>/, dockerRepositoryUrl);
      }

      // update git address in ci-template
      if (line.includes('<GIT_PROJECT_ADDRESS>')) {
        line = line.replace(/<GIT_PROJECT_ADDRESS>/, gitRepositoryUrl);
      }

      // update project name in ci-template
      if (line.includes('<GIT_PROJECT_NAME>')) {
        line = line.replace(/<GIT_PROJECT_NAME>/, projectName);
      }

      // update docker info, such as userName, password and dockerLoginUrl
      if (line.includes('<DOCKER_LOGIN_URL>')) {
        line = line.replace(/<DOCKER_LOGIN_URL>/, dockerLoginUrl);
        line = line.replace(/<DOCKER_USER>/, dockerUser);
        line = line.replace(/<DOCKER_PWD>/, dockerPassword);
      }

      fileWriteStream.write(line);
    });

    fileReadStream.on('end', () => {
      fileWriteStream.end();
    });
  }

  addCommitlint(content: Package): void {
    content['devDependencies']['@commitlint/cli'] = '^8.2.0';
    content['devDependencies']['@commitlint/config-angular'] = '^8.2.0';
    content['dependencies']['husky'] = '^3.1.0';
    content['dependencies']['lint-staged'] = '^8.2.1';
    content.husky.hooks['commit-msg'] = 'commitlint -E HUSKY_GIT_PARAMS';
  }

  remove(path: string): void {
    execSync(`rm -rf ${path}`);
  }
}
