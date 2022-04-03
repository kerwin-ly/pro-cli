import { ErrorHandler } from '@angular/core';
import { SentryService } from './sentry.service';
import { environment } from '@environments/environment';

export function loadSentry(dsn: string) {
	console.warn('load sentry[start]');
	return import('@sentry/browser')
		.then((sentry) => {
			console.warn('load sentry[success]');
			sentry.init({
				dsn,
				release: environment.version
			});
			// tslint:disable-next-line: no-any
			(window as any)._sentry = sentry;
		})
		.catch((err) => {
			console.warn('load sentry[failed]', err);
		});
}

export const SENTRY_PROVIDERS = [
	{
		provide: ErrorHandler,
		useClass: SentryService
	}
];
