---
title: "变更swap分区大小"
date: 2025-07-22
last_modified_at: 2025-07-22
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/变更swap分区大小/
toc: true
---

```bash
# 禁用现有 Swap（如有）
sudo swapoff /swapfile

# 创建 32GB Swap 文件（根据磁盘空间选择）
sudo fallocate -l 32G /swapfile

# 设置权限并格式化为 Swap
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 永久生效（添加到 /etc/fstab）
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 优化 Swappiness（临时生效）
sudo sysctl vm.swappiness=20

# 永久设置 Swappiness
echo 'vm.swappiness=20' | sudo tee -a /etc/sysctl.conf
```
