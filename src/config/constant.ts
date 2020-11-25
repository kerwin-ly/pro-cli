import { get } from 'lodash';

const templateUrl = 'ssh://git@git.company.com:58422/web/dg-cli-template.git';
const repository = get(templateUrl.match(/(?<=\/)[^\/]+(?=\.git)/), '0');
const token = '';
const docker = {
	user: '',
	pwd: ''
};
const sonarToken = '';
const yapi = {
	email: '',
	password: ''
};
const sentryToken = '';
const cliRepo = {
	// cli仓库信息，用于升级使用
	projectId: '', // gitlab dg-cli projectId
	userId: '' // userId
};
const gitHost = 'ssh://git@git.company.com:58422/frontend_poc';
const gitlabApiAddress = 'https://git.company.com/api/v4/';
const sentryApiAddress = 'http://starport.company.com/api/0/';
const sonarApiAddress = 'http://sonarqube.company.com/api/';
const yapiApiAddress = 'http://yapi.company.com/api/';

export {
	templateUrl,
	repository,
	token,
	docker,
	sonarToken,
	yapi,
	sentryToken,
	cliRepo,
	gitHost,
	gitlabApiAddress,
	sentryApiAddress,
	sonarApiAddress,
	yapiApiAddress
};
