---
title: "Anlogic UG003_AL-LINK 下载器使用说明"
date: 2025-10-30
last_modified_at: 2025-10-30
categories:
  - "FPGA"
tags:
  - "FPGA"
permalink: /fpga/anlogic-ug003-al-link-下载器使用说明/
toc: true
---

概要：本文介绍了 Anlogic UG003_AL-LINK 下载器的使用流程，包括驱动安装、TD IDE 操作步骤等，适用于使用 AL-LINK 下载器进行 FPGA Bit 流烧录的用户。  


## 1. 安装驱动  

驱动包位于 TD 软件的安装路径下，例如：  
```
Anlogic\TD_5.6.5_Release_119.222\driver\al-link\win10\x64
```

### 1.1 安装方法  

1. 打开“计算机管理”。
2. 手动安装上述路径下的驱动。
3. 确保设备管理器中对应的设备没有显示感叹号（表示驱动安装成功）。

---

## 2. 使用 TD IDE 进行下载  

### 2.1 打开 TD IDE  

界面示例：  
![alt text](/assets/images/fpga/anlogic-ug003-al-link-下载器使用说明/PixPin_2025-10-30_18-11-26.png)

### 2.2 下载流程  

1. 打开下载页面。
2. 点击 **“Refresh”** 按钮，确保可以识别芯片。  
   - 例如：页面显示“0:EF3L90”。
3. 点击 **“Add”**，添加要下载的 Bit 流文件。
4. 添加成功后，可在对应区域（④处）看到已添加的文件。
5. 点击 **“Run”** 开始下载流程。
