---
title: "Codex 接入GLM及VsCode插件使用"
date: 2026-07-06
last_modified_at: 2026-07-06
categories:
  - "AI工具使用"
tags:
  - "AI工具使用"
permalink: /ai工具使用/codex-接入glm及vscode插件使用/
toc: true
---

## 1 参考链接

Codex 菜鸟教程：https://www.runoob.com/codex/codex-tutorial.html
智谱AI文档：https://docs.bigmodel.cn/cn/coding-plan/quick-start
智谱API接入：https://bigmodel.cn/console/overview

## 2 Codex分类

1. Codex IDE，在GPT官网下
2. Codex VSCODE插件
3. Codex CLI，可以直接在github下二进制包，就不用npm了，https://github.com/openai/codex

## 3 Codex CLI部署方式

以Codex CLI为例，直接下载二进制包，双击打开（Windows下载codex-x86_64-pc-windows-msvc.exe）。

会要求你登录，如果登录，使用的是gpt的官方订阅。

如果要自己接入第三方AI的API，需要使用到CC-SWITCH：

### 3.1 CC-SWITCH转换方式

因为codex目前只支持responses协议的API，而国内厂商，比如glm，提供的都是completions类型的API，所以要通过CC-SWITCH进行转换。

![alt text](/assets/images/ai工具使用/codex-接入glm及vscode插件使用/PixPin_2026-07-06_14-49-09.png)

- 只需正确选择供应商，并填写API，API获取参考https://bigmodel.cn/console/overview

![alt text](/assets/images/ai工具使用/codex-接入glm及vscode插件使用/PixPin_2026-07-06_14-50-23.png)

设置好后启用。

- 打开设置，开启本地路由

![alt text](/assets/images/ai工具使用/codex-接入glm及vscode插件使用/PixPin_2026-07-06_14-52-07.png)

## 4 Codex VSCode插件
- 部署Codex CLI后，只需要在扩展市场，直接下载插件即可使用侧边栏功能。
![alt text](/assets/images/ai工具使用/codex-接入glm及vscode插件使用/PixPin_2026-07-06_18-57-37.png)

- 右上角点击即可打开
![alt text](/assets/images/ai工具使用/codex-接入glm及vscode插件使用/PixPin_2026-07-06_18-58-27.png)

## 5 问题

### 5.1 Codex 沙箱创建失败

暂时关闭网络代理软件尝试。

### 5.2 VSCode插件无法调整思考等级
可能是经过了代理的原因，思考等级需要直接编辑`C:\Users\Witheart\.codex\config.toml`文件，注意更换为你自己的用户名。

修改该字段：
```toml
model_reasoning_effort = "high"
```
