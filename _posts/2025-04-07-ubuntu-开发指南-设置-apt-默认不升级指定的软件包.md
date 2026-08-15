---
title: "设置 apt 默认不升级指定的软件包"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/设置-apt-默认不升级指定的软件包/
toc: true
---

概要：本文介绍了如何使用 `apt-mark` 命令设置 apt 默认不升级指定的软件包，包括如何标记软件包为保留状态以及查看已保留的软件包列表。  


## 1. 使用 `apt-mark hold` 命令  
通过 `apt-mark hold` 命令可以指定某些软件包不被自动升级。  

- **命令格式**：  
  ```bash
  sudo apt-mark hold 软件包名称
  ```

---

## 2. 查看已保留的软件包  
使用 `apt-mark showhold` 命令可以查看当前系统中被标记为保留状态的软件包。  

- **命令格式**：  
  ```bash
  apt-mark showhold
  ```  
