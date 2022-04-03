import { checkNodeVersion, getCliPkgJson } from './utils/package';
import * as program from 'commander';
import Creator from './command/creator';
import Generator from './command/generator';
import Upgrader from './command/upgrader';

const cliPkg = getCliPkgJson();
const requiredNodeVersion = cliPkg.engines.node;

checkNodeVersion(requiredNodeVersion, 'pro-cli');

// if (process.env.NODE_ENV === 'development') {
// 	process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 阻止校验证书，便于charles抓包
// }

function initCommond(): void {
	program.version(`pro-cli ${cliPkg.version}`, '-v, --version').usage('<command> [options]');

	program
		.command('new <app-name>')
		.description('create a new React project')
		.option('-f, --force', 'force to create project', false)
		.action((name: string, cmd: program.Command) => {
			const creator = new Creator(name, cmd);

			creator.create();
		});

	program
		.command('generate')
		.alias('g')
		.description('generate some tools.')
		.action(() => {
			const generator = new Generator();

			generator.init();
		});

	program
		.command('upgrade [version]')
		.description('upgrade to a new version of pro-cli')
		.action((version: string) => {
			const upgrader = new Upgrader();

			upgrader.upgrade(version);
		});

	program.parse(process.argv);

	if (!program.args || !program.args.length) {
		program.help();
	}
}

initCommond();
