import { REPOSITORY } from './constant';

const sentryTemplate = {
	upload: {
		from: './templates/sentry/sentry-upload.sh.hbs',
		to: 'scripts/sentry-upload.sh'
	},
	service: {
		from: './templates/sentry/sentry.service.ts.hbs',
		to: 'src/app/core/sentry/sentry.service.ts'
	},
	index: {
		from: './templates/sentry/index.ts.hbs',
		to: 'src/app/core/sentry/index.ts'
	}
};

const sonarTemplate = {
	shell: {
		from: './templates/sonar/sonar.sh.hbs',
		to: `${REPOSITORY}/build/sonar.sh`
	},
	yml: {
		from: './templates/sonar/sonar.yml.hbs',
		to: null
	}
};

const gitTemplate = {
	gitlabCI: {
		from: './templates/git/.gitlab-ci.yml.hbs',
		to: `${REPOSITORY}/.gitlab-ci.yml`
	}
};

const commitlintTemplate = {
	config: {
		from: './templates/lint/commitlint.config.js.hbs',
		to: `${REPOSITORY}/commitlint.config.js`
	}
};

const dockerTemplateUrl = {
	from: './templates/docker/',
	to: `${REPOSITORY}/build/`
};

export { sentryTemplate, sonarTemplate, gitTemplate, dockerTemplateUrl, commitlintTemplate };
