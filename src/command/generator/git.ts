import * as inquirer from 'inquirer';
import { Answers } from 'inquirer';
import { get } from 'lodash';
import * as chalk from 'chalk';
import { execSync } from 'child_process';
import * as ora from 'ora';
import Generator from '../generator';
import { log, throwGitlabError } from '../../utils/logger';
import { gitlabApi } from '../../api/gitlab';
import * as fs from 'fs';
import { Project } from '../../interface/gitlab-interface';
import { getDirname, cwd } from '../../utils/file';

const prompt = inquirer.createPromptModule();
const gitProcess = ora('Creating gitlab project...');

class GitGenerator extends Generator {
  constructor() {
    super();
  }

  async createPropmts(): Promise<void> {
    const fileUrl = cwd() + '/.git';

    if (fs.existsSync(fileUrl)) {
      const answers = await prompt([
        {
          type: 'confirm',
          name: 'isReplace',
          message: '.git repository already exists, would you like to replace it?',
          default: false,
        },
      ]);

      if (!answers['isReplace']) return;

      execSync('rm -rf .git');
    }

    prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Input your gitlab repository name',
        default: getDirname(),
        validate: (input: string) => {
          if (input) {
            return true;
          }

          return 'Please input your gitlab repository name';
        },
      },
    ]).then(async (data: Answers) => {
      const project = await this.initGit(data.projectName);

      log();
      log(`${chalk.green('✔')}  Successfully created project in Gitlab`);
      log(`For more details, visit ${chalk.yellow(project.http_url_to_repo)} `);
    });
  }

  async initGit(name: string): Promise<Project> {
    gitProcess.start();
    try {
      const groups = await gitlabApi.getGroups({ owned: true });
      const data = await gitlabApi.create({
        name: name,
        namespace_id: get(groups, '0.id'),
      });

      execSync('git init');
      execSync('git add .');
      execSync('git commit -m "chore(*): init project"');
      execSync(`git remote add origin ${data.ssh_url_to_repo}`);
      execSync('git push -u origin master', { stdio: 'ignore' });
      gitProcess.stop();

      return data;
    } catch (err) {
      throwGitlabError(err);
      execSync(`rm -rf ${cwd()}`);
      gitProcess.stop();
      process.exit(1);
    }
  }
}

export default GitGenerator;
