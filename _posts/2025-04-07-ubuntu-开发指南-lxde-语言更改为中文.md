---
title: "LXDE 语言更改为中文"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/lxde-语言更改为中文/
toc: true
---

概要：本文介绍了如何将LXDE系统的语言更改为中文，提供了具体的操作步骤和相关配置文件的修改方法。


## 1. 修改配置文件  

### 1.1 文件位置  
- 配置文件位于 `/etc/default/locale`。

### 1.2 修改内容  
- 将文件内容修改为以下内容：

- 中文：
```bash
LANG="zh_CN.UTF-8"
LANGUAGE="zh_CN:zh"
```

- 英文则更改为：

```bash
LANG="en_US.UTF-8"
LANGUAGE="en_US:en"
```

### 2.1 重启生效  
- 修改完成后，可能需要重启系统或重新登录以使更改生效。
