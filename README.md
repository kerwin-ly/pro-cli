# dg-cli

暂停维护，迁移至公司私有库

> dg-cli 旨在简化项目开发之初重复且繁琐的前端工程搭建及基础配置工作，同时提供公司的轮子库组件引入配置。

## Getting Started

```bash
npm i -g dg-cli@git+ssh://git@git.company.com:58422/web/dg-cli.git#{tag}
```

## Features

相对于`angular-cli`等传统的 cli 工具，`dg-cli`是为公司项目定制化开发的，具有更强的针对性。目前它可以做到这些：

- http 请求自定义拦截器处理，可通过`globalLoading`和`globalError`控制全局 loading 和错误信息
- 默认集成了`tslint`，`stylelint`，`commitlint`等 lint 规范，保证每个项目使用一套规则。
- 使用 yarn 作为包管理工具
- 可通过`new`命令创建项目，提供 CI/CD 基础配置，初始化 git 并自动关联到 gitlab 仓库，自动创建 CI/CD variables 等功能
- 自动化集成`sonar`并添加到 CI/CD 流程中，完成后会立刻在 SonarQube 上创建项目
- 自动化集成`sentry`并直接在`sentry仓库`创建项目
- 支持通过`yapi`文档直接生成`Angular`的`service`代码
- 支持`upgrade`版本升级

## Usage

### 创建项目

#### dg-cli new

运行以下命令来新创建一个项目：

```bash
dg-cli new my-project
```

```bash
Options:
  -f, --force  force to create project (default: false)
```

### 生成依赖

#### dg-cli generate

目前我们支持了`git component sentry sonar api`的自动集成。运行以下命令，可对其进行查看：

```bash
dg-cli generate
```

### 更新版本

#### dg-cli upgrade

升级到指定版本，如: 1.1.2

```bash
dg-cli upgrade 1.1.2
```

升级到最新版本

```bash
dg-cli upgrade
```
