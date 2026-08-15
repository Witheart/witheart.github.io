---
title: "vscode git graph 卡顿"
date: 2025-06-16
last_modified_at: 2025-06-16
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/vscode-git-graph-卡顿/
toc: true
---

问题：
cli运行git status、git log都不会卡顿，但是git graph视图中，每次更新（手动刷新/自动更新）都要卡顿10分钟

具体表现就是这里有一个小蓝条一直在滚动加载
![alt text](/assets/images/git-与-gitblit使用/vscode-git-graph-卡顿/PixPin_2025-06-16_15-30-49.png)

而另一个仓库就一点都不卡顿，同样是Android系统的SDK源码仓库，且另一个仓库还更大

初始怀疑是另一个仓库的gitignore忽略的内容更少，所以git在统计变动时更轻松，于是减少了忽略的文件，但是问题没有解决

查看输出，筛选git相关内容

发现每次刷新git graph时，执行的并不是淡出的git log，而是下面的命令
![alt text](/assets/images/git-与-gitblit使用/vscode-git-graph-卡顿/PixPin_2025-06-16_15-35-08.png)

git log --format=%H%n%aN%n%aE%n%at%n%ct%n%P%n%D%n%B -z --shortstat -n50 --skip=0 --topo-order --decorate=full --stdin

--topo-order：强制按拓扑顺序排序（比默认时间排序更慢）。
--decorate=full：解析完整的引用路径（如 refs/heads/master）。
--shortstat：需计算每个提交的变更行数。

那为什么另外一个仓库不卡呢？很可能的一个原因是，其他仓库已经有很多git commit历史了，而上面的命令只排序50条内容，最近的50条内容并不包括一些大型的变更。
而卡顿的这个仓库是新仓库，最近的50条内容包含了仓库第一次初始化的提交，第一次提交的内容很多，导致要统计的内容很多

目前以上都为猜想，
