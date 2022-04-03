import { execSync } from 'child_process';
import { getPkgJson, install } from './package';
import * as path from 'path';
import { render } from './handlebars';
import { sentryTemplate } from '@config/template';
import { getCurrentPath } from './path';

export function installSentry() {
	if (!hasSentryCliSync()) {
		execSync('npm install -g @sentry/cli', { stdio: 'inherit' }); // 如果没有安装sentry/cl，首先全局安装
	}
	if (hasBrowser()) return;
	install({ dependencies: ['@sentry/browser'] });
}

export function hasSentryCliSync(): boolean {
	let ret = false;
	try {
		execSync('sentry-cli --version', { stdio: 'ignore' });
		ret = true;
	} catch (error) {
		ret = false;
	}
	return ret;
}

export function hasBrowser(): boolean {
	const pkg = getPkgJson();
	return !!pkg['dependencies']['@sentry/browser'];
}

export function renderSentryTmp(data: { authToken: string; projectName: string }): void {
	render(path.resolve(__dirname, sentryTemplate.upload.from), data, getCurrentPath(sentryTemplate.upload.to));
	render(path.resolve(__dirname, sentryTemplate.service.from), null, getCurrentPath(sentryTemplate.service.to));
	render(path.resolve(__dirname, sentryTemplate.index.from), null, getCurrentPath(sentryTemplate.index.to));
}
