---
title: "Ubuntu下查看cpu频率"
date: 2024-12-27
last_modified_at: 2024-12-27
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu下查看cpu频率/
toc: true
---

- **更新软件包列表**：
  ```bash
  sudo apt update
  ```

- **安装cpufrequtils工具**：
  ```bash
  sudo apt install cpufrequtils
  ```

- **查看CPU频率信息**：
  ```bash
  cpufreq-info
  ```

- **每秒监控当前CPU频率**：
  ```bash
  watch -n 1 "cpufreq-info | grep 'current CPU frequency'"
  ```
