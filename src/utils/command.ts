import * as program from 'commander';
import Creator from '../index';

process.env.NODE_PATH = __dirname + '/../node_modules'; // 重新指定node运行环境

function initCommand(): void {
  // program.version('1.0.0', '-v --version');
  program.version(`dg-cli ${require('../../package').version}`).usage('<command> [options]');

  program
    .command('new <app-name>')
    .description('create a new Angular project')
    .action(() => {
      const project = new Creator();

      project.init();
    });

  program.parse(process.argv); // 解析字符串组

  if (!program.args || !program.args.length) {
    program.help();
  }
}

export { initCommand };
