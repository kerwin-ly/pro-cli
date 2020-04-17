import * as ora from 'ora';
import * as program from 'commander';

const option: string = program.parse(process.argv).args[1];
const defaultName: string = typeof option === 'string' ? option : 'my-project';

const questionList = [
  {
    type: 'input',
    name: 'name',
    message: 'What name would you like to use for the project?',
    default: defaultName,
    filter(val: string): string {
      return val.trim();
    },
  },
  {
    type: 'input',
    name: 'description',
    message: 'The description of the project',
    default: null,
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
    name: 'dockerRepositoryUrl',
    message: 'Input the docker image address of your project',
    default: 'http://dockerhub.dg.com/dg/project',
  },
  {
    type: 'input',
    name: 'gitRepositoryUrl',
    message: 'Input the ssh git repository address of your project',
    default: 'ssh://git@git.dg.com:xxxx/web/project.git',
  },
];

export { questionList };
