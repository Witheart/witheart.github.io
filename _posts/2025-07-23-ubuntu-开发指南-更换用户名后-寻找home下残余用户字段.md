---
title: "更换用户名后，寻找home下残余用户字段"
date: 2025-07-23
last_modified_at: 2025-07-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/更换用户名后-寻找home下残余用户字段/
toc: true
---

Ubuntu 更换用户名后，如果有具体的依赖于用户名称的配置，无法自动识别更改，需要手动更改，具体如下：

例子：在用户KangHua的家目录下递归搜索包含字符串firefly的文件：
```bash
# 切换到KangHua用户（确保有权限）
sudo -u KangHua bash
cd /home/KangHua

# 搜索文本文件中的"firefly"（排除二进制文件）
grep -rl --exclude-dir={.cache,.local,.vscode} 'firefly' .

```
