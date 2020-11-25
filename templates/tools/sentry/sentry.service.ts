import { ErrorHandler, Injectable } from '@angular/core';
import * as Sentry from '@sentry/browser';

if (!location.host.includes('localhost')) {
	Sentry.init({
		dsn: 'http://d34fe627b8e14b769b5b3cc95d5eb5be@starport.company.com/35',
		release: 'development'
	});
}

@Injectable()
export class SentryService implements ErrorHandler {
	// tslint:disable-next-line: no-any
	handleError(error: any): void {
		Sentry.captureException(error.originalError || error);
	}
}
