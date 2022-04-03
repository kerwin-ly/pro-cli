export interface ISonarProject {
	project: {
		key: string;
		name: string;
		qualifier: string;
	};
}

export interface ISonarProjectParams {
	name: string;
	project: string;
}
