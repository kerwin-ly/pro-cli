/**
 * 动态导入文件json
 * @export
 * @interface ImportJson
 */
export interface ImportJson {
  COMPONENTS: {
    [key: string]: string;
  };
  ENTRY_COMPONENTS: {
    [key: string]: string;
  };
  SERVICES: {
    [key: string]: string;
  };
  MODULES: {
    [key: string]: string;
  };
}

export interface Dependencies {
  dependencies?: string[];
  devDependencies?: string[];
}
