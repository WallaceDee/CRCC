# Read Me

## 简介

### 技术栈

本项目使用了

1. `vue`框架，`vue-cli3`脚手架
2. `view-design`UI 框架

## 开发运行与打包

### 开发运行/调试项目

1. 使用 cmd/xshell 等命令行工具打开项目根本目录
2. 运行`npm install`（安装一次后无须再次安装）
3. 安装成功后，运行`npm run serve`。启动后，本地服务运行在 http://localhost:8000/

### 打包项目

1. 同上
2. 同上 3.运行`npm run build`。打包完成后，前端的静态文件会输出在./dist/目录下

## 项目结构

1. `./public/`文件夹下存放的是静态文件，打包会复制其内容到`dist`目录;
2. `./vue.config.js`是关于`webpack`的配置;

3. `./router.js`是此项目的路由配置;
4. `./main.js`是此项目的入口文件;
5. `./src/`是项目的主要文件。

- `./src/api`————所有的接口
- `./src/asset`————资源文件
- `./src/components`————组件
- `./src/config`————项目配置，`proxy.js`是本地服务所使用的代理配置
- `./src/libs`————此项目使用的库和公用方法，包括`axios`等
- `./src/store`————此项目使用的状态管理库
- `./src/view`————页面的文件
