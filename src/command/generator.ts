import * as inquirer from 'inquirer';
import { Answers } from 'inquirer';
import { GeneratorFactory } from './generator/genetatorFactory';
import GitGenerator from './generator/git';
import SonarGenerator from './generator/sonar';
import SentryGenerator from './generator/sentry';
import ServiceGenerator from './generator/service';

const prompt = inquirer.createPromptModule();

export default class Generator {
  protected type: string;

  constructor() {
    this.type = '';
  }

  init(): void {
    prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select a tool to generate',
        choices: ['git', 'sonar', 'sentry', 'api'],
        default: 'git',
      },
    ]).then((data: Answers) => {
      switch (data.type) {
        case 'git':
          const gitInstance = GeneratorFactory.getInstance('git') as GitGenerator;
          gitInstance.createPropmts();
          break;
        case 'sonar':
          const sonarInstance = GeneratorFactory.getInstance('sonar') as SonarGenerator;
          sonarInstance.createPrompt();
          break;
        case 'sentry':
          const sentryInstance = GeneratorFactory.getInstance('sentry') as SentryGenerator;
          sentryInstance.createPrompt();
          break;
        case 'api':
          const serviceInstance = GeneratorFactory.getInstance('service') as ServiceGenerator;
          serviceInstance.createPrompt();
      }
    });
  }
}
