export interface ISentryCreateParams {
	name: string;
	team: string;
	platform?: string;
}

export interface ISentryProject {
	avatar: {
		avatarUuid: number;
		avatarType: string;
	};
	id: string;
	name: string;
	slug: string;
	status: string;
}
