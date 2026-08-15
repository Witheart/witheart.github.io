---
title: "Git 速度慢配置使用 Clash 代理"
date: 2025-09-09
last_modified_at: 2025-09-09
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/git-速度慢配置使用-clash-代理/
toc: true
---

由于github不一定被墙，所以Clash代理规则不一定生效，本文通过配置git走代理提高速度。


- 设置中可以配置端口
![alt text](/assets/images/git-与-gitblit使用/git-速度慢配置使用-clash-代理/PixPin_2025-09-09_14-40-42.png)

- 首页中，查看系统代理地址
![alt text](/assets/images/git-与-gitblit使用/git-速度慢配置使用-clash-代理/PixPin_2025-09-09_14-41-43.png)

- 使用该地址进行配置，在git bash中输入
```bash
git config --global http.proxy http://127.0.0.1:7897
git config --global http.proxy https://127.0.0.1:7897
```

- 验证配置是否成功
```bash
git config --global --get http.proxy
git config --global --get https.proxy
```

- 删除代理配置
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```
