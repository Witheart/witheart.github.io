---
title: "Gitblit 迁移指南"
date: 2025-03-08
last_modified_at: 2025-03-08
categories:
  - "Git 与 Gitblit使用"
tags:
  - "Git 与 Gitblit使用"
permalink: /git-与-gitblit使用/gitblit-迁移指南/
toc: true
---

概要：由于硬盘空间太小，需要将 Gitblit 迁移到其他位置。本文介绍了 Gitblit 迁移的详细步骤，包括停止服务、复制数据、修改配置、更新启动脚本、启动 Gitblit 以及验证迁移是否成功。  


## 1. 停止 Gitblit 服务  

在迁移数据前，先停止 Gitblit 以防止数据损坏。  

如果你是以 `systemd` 方式运行的 Gitblit，执行：  
```bash
sudo systemctl stop gitblit
```
或者，如果你是手动运行 Gitblit 的话，找到其进程并终止：  
```bash
ps aux | grep gitblit
kill -9 <gitblit进程ID>
```

---

## 2. 复制 Gitblit 目录到新硬盘  

使用 `rsync` 复制 Gitblit 目录到新的硬盘：  
```bash
sudo rsync -avz <旧路径>/ <新路径>/
```
### **参数解释**  
- `-a`：保持文件权限、时间戳、符号链接等属性  
- `-v`：显示详细信息  
- `-z`：压缩数据以提高传输效率  

---

## 3. 修改 Gitblit 配置  

如果 Gitblit 的配置文件（通常是 `gitblit.properties`）中有旧路径，你需要修改它：  
```bash
nano <新路径>/data/gitblit.properties
```
将所有旧路径修改为新路径。  

---

## 4. 更新启动脚本  

如果你有 `systemd` 服务文件（通常位于 `/etc/systemd/system/gitblit.service`），你需要更新其中的 `ExecStart` 路径：  
```bash
sudo nano /etc/systemd/system/gitblit.service
```
修改为：  
```ini
ExecStart=<新路径>/gitblit.sh
WorkingDirectory=<新路径>/
```
然后重新加载 `systemd`：  
```bash
sudo systemctl daemon-reload
```
或者修改 `/etc/rc.local` 启动脚本。  

此外，`gitblit.sh` 文件中的路径可能也需要修改。  

---

## 5. 启动 Gitblit  

```bash
sudo systemctl start gitblit
```
或者，直接重启服务器。  

---

## 6. 验证迁移是否成功  

### **6.1 检查 Gitblit 是否在运行**  
```bash
ps aux | grep gitblit
```
### **6.2 检查 Gitblit Web 界面**  
访问 Web 界面，确认 Gitblit 是否正常工作。  

---

## 7. （可选）删除旧数据  

如果确认 Gitblit 在新位置可以正常运行，先将原有的 Gitblit 目录压缩备份：  
```bash
tar -czvf gitblit_backup.tar.gz <旧路径>/
```
然后可以删除旧的 Gitblit 目录以释放空间：  
```bash
sudo rm -rf <旧路径>/
```

---

至此，Gitblit 迁移完成！ 🎉
