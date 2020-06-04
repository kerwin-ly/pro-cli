# dg-cli

> CLI for creating reusable  Angular libraries, based on [ng-alain](https://ng-alain.com/docs/getting-started/en).The template is [here](https://github.com/kerwin-ly/dg-cli-template).

## Getting Started

Install

```shell
npm install -g dg-angular-cli
```

Create a project:

```shell
dg-cli new my-project
```

## Features
- Supports customized http interceptor, and resolve `loading` and `error` of http requests automaticly
- Supports CI/CD config
- Supports commitlint config 

## Notice

If you want to use CI/CD, please make sure the `Secret variables` in your `gitlab` repository has been created and keep the name unique.
