---
title: "Ubuntu开机脚本rc.local没有生效"
date: 2025-07-31
last_modified_at: 2025-07-31
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu开机脚本rc-local没有生效/
toc: true
---

在 Ubuntu 20.04 中，`rc.local` 默认是**不启用**的，因为它使用了更新的 systemd 启动系统。但你可以手动启用它，以下是完整步骤：

### 启用 rc.local 的步骤

1. **创建并编辑 rc.local 文件**
   ```bash
   sudo nano /etc/rc.local
   ```
   添加以下内容（记得替换成你自己的命令）：（-e选项会导致脚本在遇到错误时退出，后面的命令都不执行）
   ```bash
   #!/bin/sh -e
   #
   # 在这里添加你的开机命令（在 exit 0 之前）
   #
   # 示例：启动时创建一个日志文件
   echo "$(date) - 系统已启动" > /var/log/mycustom.log
   
   exit 0
   ```

2. **赋予执行权限**
   ```bash
   sudo chmod +x /etc/rc.local
   ```

### rc.local不生效解决
查找相关日志
```bash
dmesg | grep -i "rc.local"
```

可能有如下的输出
```bash
[    8.096284] systemd-rc-local-generator[198]: /etc/rc.local is not marked executable, skipping.
```

意味着脚本没有可执行权限，需要赋予执行权限：
```bash
sudo chmod +x /etc/rc.local
```
