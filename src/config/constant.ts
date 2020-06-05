import { get } from 'lodash';

const templateUrl = `https://github.com/kerwin-ly/dg-cli-template.git`;
const repository = get(templateUrl.match(/(?<=\/)[^\/]+(?=\.git)/), '0');

export { templateUrl, repository };
