import * as ora from 'ora';
import * as program from 'commander';

const spinner = ora('Downloading please wait......');
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
    type: 'confirm',
    name: 'commitlint',
    message: 'Would you like to enable the commit lint?',
    default: true,
  },
];

export { questionList };
