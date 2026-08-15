---
title: "LXDE 开机默认不启动桌面"
date: 2025-04-07
last_modified_at: 2025-04-07
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/lxde-开机默认不启动桌面/
toc: true
---

概要：本文介绍了如何在 LXDE 系统中禁用桌面组件，使系统启动时不加载桌面环境，适用于信息亭等信息展示用途。  


## 1. 禁用桌面组件  

### 1.1 禁用 PCManFM（桌面管理器）  
编辑 LXDE 的自动启动配置文件：  
```bash
nano ~/.config/lxsession/LXDE/autostart
```  
注释掉或删除与 `pcmanfm` 相关的行：  
```
#@pcmanfm --desktop
```

### 1.2 禁用 LXPanel（任务栏）  
在同一文件中，注释掉 LXPanel 的行：  
```
#@lxpanel --profile LXDE
```

---

## 2. 实测效果  

- 系统启动完成后，桌面没有任何东西，显示全屏黑色。  
- 右键菜单可以唤出并启动指定的软件。  
- 搭配软件开机启动，可以用于信息亭等信息展示用途。  
- 终端可以通过快捷键唤起。
