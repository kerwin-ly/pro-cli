import { getCliPkgJson } from '../../src/utils/package';
import * as program from 'commander';

test('pro-cli version', () => {
	expect(getCliPkgJson()).toBe('2.2.1');
});
// program.version(`pro-cli ${cliPkg.version}`, '-v, --version').usage('<command> [options]');
