#!/usr/bin/env node
import * as program from 'commander';
import Creator from '../command/creator';

initCommond();

function initCommond(): void {
  program.version(`dg-cli ${require('../../package').version}`).usage('<command> [options]');

  program
    .command('new <app-name>')
    .description('create a new Angular project')
    .option('-f, --force', 'force to create project', false)
    .action((cmd: program.Command) => {
      const creator = new Creator(cmd);
      creator.create();
    });

  program.parse(process.argv);

  if (!program.args || !program.args.length) {
    program.help();
  }
}
