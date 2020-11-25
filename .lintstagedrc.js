#!/usr/bin/env node

module.exports = {
  'src/**/*.ts': () => [`npm run lint:ts`],
};
