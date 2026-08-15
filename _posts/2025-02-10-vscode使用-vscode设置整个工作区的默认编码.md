---
title: "VSCode设置整个工作区的默认编码"
date: 2025-02-10
last_modified_at: 2025-02-10
categories:
  - "VSCode使用"
tags:
  - "VSCode使用"
permalink: /vscode使用/vscode设置整个工作区的默认编码/
toc: true
---

1. 编辑setting.json文件
   - 生成setting.json文件的方式请查看文章《[VSCode如何创建配置文件setting.json](/vscode使用/vscode如何创建配置文件setting-json/)》

2. 添加如下的代码（以GB2312为例）
```json
"files.encoding": "gb2312"
```

3. 注意，在设置前打开的文件可能编码格式并不会更改
