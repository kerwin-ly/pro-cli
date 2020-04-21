import * as program from 'commander';
import Creator from '../index';

const project = new Creator();
process.env.NODE_PATH = __dirname + '/../node_modules'; // 重新指定node运行环境

/**
 * 初始化命令
 * 目前支持 -version, -help
 * @export
 */
function initCommand(): void {
  program.version('1.0.0', '-v --version');

  program
    .command('new')
    .description('generate a new Angular project')
    .action(() => {
      project.init();
    });

  program.parse(process.argv); // 解析字符串组

  if (!program.args || !program.args.length) {
    program.help();
  }
}

export { initCommand };
