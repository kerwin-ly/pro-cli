import * as inquirer from 'inquirer';
import * as path from 'path';
import { questionList } from './config/question';
import * as ora from 'ora';
import { templateUrl, repository } from './config/constant';
import { exec } from 'child_process';
import * as fs from 'fs';

const downloadProcess = ora('Download template...');
const modifyProcess = ora('Install packages...');

export default class Creator {
  sourcePath = '../template'; // 模板文件path
  targetPath = '../'; // 创建项目path

  constructor() {}

  init(): void {
    inquirer.prompt<inquirer.Answers>(questionList).then((answers) => {
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
    });
  }

  /**
   * 更新依赖相关
   * @param {inquirer.Answers} answers
   * @memberof Creator
   */
  updatePackage(answers: inquirer.Answers): void {
    modifyProcess.start();
    const { name, description } = answers;

    fs.rename(path.join(__dirname, `../${repository}`), path.join(__dirname, `../${name}`), (err) => {
      if (err) {
        modifyProcess.fail('Install packages failed');
        throw err;
        return;
      }

      const pkg = process.cwd() + `/${name}/package.json`;
      const content = JSON.parse(fs.readFileSync(pkg, 'utf-8'));

      content.name = name;
      content.description = description;
      fs.writeFileSync(pkg, JSON.stringify(content, null, '\t'));
      modifyProcess.succeed('Install packages succeed');
    });
  }
}
