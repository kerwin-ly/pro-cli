#!/usr/bin/env node
import * as program from 'commander';
import Creator from '../command/creator';
import Generator from '../command/generator';
import Upgrader from '../command/upgrader';

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 阻止校验证书，便于charles抓包
}

initCommond();

function initCommond(): void {
  program.version(`dg-cli ${require('../../package').version}`, '-v, --version').usage('<command> [options]');

  program
    .command('new <app-name>')
    .description('create a new Angular project')
    .option('-f, --force', 'force to create project', false)
    .action((name: string, cmd: program.Command) => {
      const creator = new Creator(name, cmd);

      creator.create();
    });

  program
    .command('generate')
    .description('generate some tools.')
    .action(() => {
      const generator = new Generator();

      generator.init();
    });

  program
    .command('upgrade [version]')
    .description('upgrade to a new version of dg-cli')
    .action((version: string) => {
      const upgrader = new Upgrader();

      upgrader.upgrade(version);
    });

  program.parse(process.argv);

  if (!program.args || !program.args.length) {
    program.help();
  }
}
