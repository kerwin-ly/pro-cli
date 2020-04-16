import * as inquirer from 'inquirer';
import * as path from 'path';
import { questionList } from './config/question';
import * as ora from 'ora';
import { templateUrl, repository } from './config/constant';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as chalk from 'chalk';
import { Subject } from 'rxjs';

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
        console.log(chalk.red('Error: The directory is existed, please remove it and try again.'));
        return;
      }
      this.downloadTemplate(answers);
    });
  }

  /**
   * 下载仓库模板
   * @param {inquirer.Answers} answers
   * @memberof Creator
   */
  downloadTemplate(answers: inquirer.Answers): void {
    downloadProcess.start();
    exec(`git clone ${templateUrl}`, (err) => {
      if (err) {
        downloadProcess.fail('Download template failed');
        throw err;
        return;
      }

      downloadProcess.succeed('Download template succeed');
      this.updatePackage(answers);
      this.removeExtraFiles();
      this.renameRepository(answers['name']);
    });
  }

  /**
   * 更新项目名称
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
   * 更新依赖
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

      // add commitlint template
      if (commitlint) {
        this.addCommitlint(content);
      }

      // add CI/CD template
      if (continuous) {
        this.addContinuousTool();
      }

      fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
      modifyProcess.succeed('Update template succeed');
    } catch (error) {
      modifyProcess.fail('Update template failed');
      throw error;
    }
  }

  /**
   * 添加ci/cd工具
   * @memberof Creator
   */
  addContinuousTool(): void {
    const fileReadStream = fs.createReadStream(path.join(__dirname, './template/cicd/.gitlab-ci.yml'));
    console.log(fileReadStream);
    const fileWriteStream = fs.createWriteStream(process.cwd() + `/${repository}/.gitlab-ci.yml`);

    fileReadStream.on('data', (data: string | Buffer) => {
      console.log(data);
      fileWriteStream.write(data);
    });

    fileReadStream.on('end', () => {
      fileWriteStream.end();
    });
  }

  /**
   * 添加commitlint依赖
   * @param {*} content
   * @memberof Creator
   */
  addCommitlint(content: Package): void {
    content['devDependencies']['@commitlint/cli'] = '^8.2.0';
    content['devDependencies']['@commitlint/config-angular'] = '^8.2.0';
    content['dependencies']['husky'] = '^3.1.0';
    content['dependencies']['lint-staged'] = '^8.2.1';
    content.husky.hooks['commit-msg'] = 'commitlint -E HUSKY_GIT_PARAMS';
    fs.writeFileSync(
      process.cwd() + `/${repository}/commitlint.config.js`,
      fs.readFileSync(path.join(__dirname, './template/commitlint/commitlint.config.js'))
    );
  }

  /**
   * 删除多余文件
   * @memberof Creator
   */
  removeExtraFiles(): void {
    fsExtra.removeSync(process.cwd() + `/${repository}/.git`);
  }
}
