import GitGenerator from './git';
import ToolGenerator from './sentry';
import SonarGenerator from './sonar';
import SentryGenerator from './sentry';
import { error } from '../../utils/logger';
import ServiceGenerator from './service';

export class GeneratorFactory {
  static git: GitGenerator;
  static sentry: ToolGenerator;
  static sonar: SonarGenerator;
  static service: ServiceGenerator;

  static getInstance(type: string) {
    switch (type) {
      case 'git':
        if (GeneratorFactory.git) {
          return GeneratorFactory.git;
        }
        return (GeneratorFactory.git = new GitGenerator());
      case 'sonar':
        if (GeneratorFactory.sonar) {
          return GeneratorFactory.sonar;
        }
        return (GeneratorFactory.sonar = new SonarGenerator());
      case 'sentry':
        if (GeneratorFactory.sentry) {
          return GeneratorFactory.sentry;
        }
        return (GeneratorFactory.sentry = new SentryGenerator());
      case 'service':
        if (GeneratorFactory.service) {
          return GeneratorFactory.service;
        }
        return (GeneratorFactory.service = new ServiceGenerator());
      default:
        error('Cannot get type, only support git, component, sonar and sentry');
        return;
    }
  }
}
