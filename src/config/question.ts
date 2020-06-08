import { Answers } from 'inquirer';

function initQuestions(name: string): Answers {
  return [
    {
      type: 'input',
      name: 'name',
      message: 'What name would you like to use for the project?',
      default: name,
      filter(val: string): string {
        return val.trim();
      },
      validate: (input: string) => {
        if (input) {
          return true;
        }

        return 'Project name is required';
      },
    },
    {
      type: 'input',
      name: 'description',
      message: 'The description of the project',
      default: 'An angular project',
    },
    {
      type: 'confirm',
      name: 'commitlint',
      message: 'Would you like to enable the commit lint?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'continuous',
      message: 'Would you like to use CI/CD?',
      default: true,
    },
    {
      type: 'input',
      name: 'gitRepositoryUrl',
      message: 'Input the ssh git repository address',
      default: 'ssh://git@git.dg.com:xxxx/web/project.git',
      validate: (input: string) => {
        if (input.startsWith('ssh://')) {
          return true;
        }
        return 'Only support ssh protocol, please add the prefix of Git url ';
      },
      when: hasContinuousTool(),
    },
    {
      type: 'input',
      name: 'dockerRepositoryUrl',
      message: 'Input the docker image address',
      default: 'http://dockerhub.dg.com/dg/project',
      validate: (input: string) => {
        if (input.startsWith('http://' || input.startsWith('https://'))) {
          return true;
        }
        return 'Please add the prefix of Docker url ';
      },
      when: hasContinuousTool(),
    },
    {
      type: 'input',
      name: 'dockerUser',
      message: 'Input your docker account',
      default: 'DOCKER_USER',
      transform: (input: string) => {
        return input.toUpperCase();
      },
      when: hasContinuousTool(),
    },
    {
      type: 'input',
      name: 'dockerPassword',
      message: 'Input your docker password',
      default: 'DOCKER_PWD',
      transform: (input: string) => {
        return input.toUpperCase();
      },
      when: hasContinuousTool(),
    },
  ];
}

function hasContinuousTool() {
  return function (answers: Answers) {
    return answers['continuous'];
  };
}

export { initQuestions };
