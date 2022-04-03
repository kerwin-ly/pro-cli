import { Answers } from 'inquirer';

function initQuestions(name: string): Answers {
	return [
		{
			type: 'input',
			name: 'name',
			message: 'Input your project name',
			default: name,
			filter(val: string): string {
				return val.trim();
			},
			validate: (input: string) => {
				if (!input) {
					return 'Please input the project name!';
				}
				const reg = /^[a-z]+\w*$/g;

				if (!reg.test(input)) {
					return `Only allowed to start with lowercase letters, can contain only letters, digits and '_'`;
				}
				return true;
			}
		},
		{
			type: 'input',
			name: 'description',
			message: 'Input your project descriptions',
			default: 'A react project'
		},
		{
			type: 'confirm',
			name: 'commitlint',
			message: 'Would you like to use commitlint?',
			default: true
		},
		{
			type: 'confirm',
			name: 'initGit',
			message: 'Would you like to init git?',
			default: true
		},
		{
			type: 'confirm',
			name: 'continuous',
			message: 'Would you like to use CI/CD?',
			default: true
		},
		{
			type: 'confirm',
			name: 'sonar',
			message: 'Would you like to add sonar?',
			default: false,
			when: (answers: Answers) => answers.continuous
		},
		{
			type: 'input',
			name: 'sonarProjectName',
			message: 'Input the project name which shows in sonarqube',
			default: name,
			validate: (input: string) => {
				if (!input) {
					return 'Please input the project name!';
				}

				return true;
			},
			when: (answers: Answers) => answers.sonar
		},
		{
			type: 'input',
			name: 'dockerRepositoryUrl',
			message: 'Input docker images address',
			default: `dockerhub.company.com/company/${name}`,
			validate: (input: string) => {
				if (!input.startsWith('dockerhub.company.com')) {
					return 'The domain name should be dockerhub.company.com';
				}
				return true;
			},
			when: (answers: Answers) => answers.continuous
		}
	];
}

export { initQuestions };
