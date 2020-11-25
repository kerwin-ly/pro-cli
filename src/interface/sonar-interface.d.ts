export interface SonarProject {
  project: {
    key: string;
    name: string;
    qualifier: string;
  };
}

export interface ProjectParams {
  name: string;
  project: string;
}
