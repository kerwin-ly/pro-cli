import * as inquirer from 'inquirer';
import * as path from 'path';
import { copydir } from './utils/file';
import { questionList } from './config/question';
import * as ora from 'ora';

const spinner = ora('Generate project...');

export default class Creator {
  sourcePath = '../template'; // 模板文件path
  targetPath = '../'; // 创建项目path

  constructor() {}

  init(): void {
    inquirer.prompt<inquirer.Answers>(questionList).then((answers) => {
      console.log('answers', answers);
      spinner.start();
      this.addPackage(answers);
      copydir(path.join(__dirname, '../template'), path.join(__dirname, '../' + answers['name']));
      spinner.stop();
    });
  }

  addPackage(answers: inquirer.Answers): void {}
}
