---
title: "HW-T3568I Ubuntu 接口测试"
date: 2025-05-08
last_modified_at: 2025-05-08
categories:
  - "测试SOP"
tags:
  - "测试SOP"
permalink: /测试sop/hw-t3568i-ubuntu-接口测试/
toc: true
---

概要：本文介绍了 HW-T3568I 在 Ubuntu 系统下各接口的测试方法，包括终端操作、测试工具使用、各类接口（如 LVDS、USB、TF 卡、WLAN、以太网、4G、音频、GPIO、串口 COM）连接与验证流程，辅以操作截图和脚本命令，便于用户逐项进行功能验证。

**注意：测试过程中，接口插拔不能带电操作**


## 1. 测试接口位置标识  

![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-17.png)

---

## 2. 终端使用方式  

接入键盘，使用快捷键 `Ctrl + Alt + T` 唤起终端。  

- 若无法唤起终端，先鼠标点击桌面空白处后再次尝试。  
- 终端唤起后，若为普通用户模式（显示 user@user），输入 `su` 切换为 root 用户，密码为 `123456`。  
- 密码输入过程无显示为正常现象，输入完毕后按回车确认。  
- 切换成功后终端显示为 `root@user`。

![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-5.png)

---

## 3. 测试工具位置与使用  

将测试工具放入 FAT 格式 U 盘的英文路径文件夹中，插入待测板。

### 3.1 方式一：图形界面操作  

1. 桌面点击 Computer 图标  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-19.png)

2. 在弹出窗口左侧一栏点击 U 盘目录  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-7.png)  

3. 进入测试工具所在文件夹  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-8.png)  

4. 点击地址栏，右键复制地址  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-9.png)  

5. 打开终端，输入 cd 和空格，然后粘贴地址，按回车进入测试工具所在文件夹  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-10.png)  

### 3.2 方式二：终端命令  

- 打开终端，输入以下命令  
  ```bash
  cd /media/user/
  ```
- 按 Tab 键自动补全，找到 U 盘目录，进入待测工具文件夹  

---

## 4. LVDS  

- 接入 LVDS 屏幕，屏幕内容应完整显示，无拉伸、变形、偏移等问题。

---

## 5. USB  

- 接入鼠标、键盘可正常使用。  
- 接入 FAT 格式 U 盘，系统可正常读取，容量显示正常。

查看 U 盘容量方法：  
1. 桌面点击 Computer 图标  
2. 点击左侧列表中的 U 盘  
3. 在底部查看容量信息  

![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-11.png)

---

## 6. TF 卡  

- 接入 FAT 格式 TF 卡，系统可正常读取，容量显示正常。  
- 查看方式同 USB。  

![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-12.png)  
![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-13.png)

---

## 7. WLAN  

1. 接入天线  
2. 左键单击选择 WiFi 连接  

   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-14.png)  

3. 按提示输入密码  

   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-15.png)  

4. 连接成功示意图  

   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-16.png)  

5. 在未接入其他网络（有线/4G）情况下，进行 ping 测试，验证网络是否正常：  
   ```bash
   ping www.baidu.com
   ```

---

## 8. eth0  

- 测试方法同 eth1（见下节）。

---

## 9. eth1  

1. 接入网线  
2. 在未接入其他网络（WiFi/4G）情况下进行 ping 测试：  
   ```bash
   ping www.baidu.com
   ```

---

## 10. 4G
1. 接入 4G 模块，连接天线

### 10.1 有SIM卡情况
1. 插入 SIM 卡  
   SIM 卡接入方向：  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-18.png)

2. 开机后等待约 40 秒（直到终端输入ifconfig后，可以看到ppp0节点）
3. 在无其他网络连接（WiFi/eth）下进行 ping 测试：  
   ```bash
   ping www.baidu.com
   ```

### 10.2 无SIM卡情况
1. 终端下输入
   ```bash
   ls /dev/ttyUSB*
   ```
   
2. 输出4个设备
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-20.png)

---

## 11. Audio  

- 接入喇叭，播放音频，确认音频输出是否正常。

---

## 12. GPIO  

1. 使用 GPIO 测试线对接 GPIO，使用脚本进行测试。  

治具定义：  
- 短接 pin1-2、pin3-4、pin6-7、pin8-9  

  ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-2.png)

2. 打开终端，进入脚本所在目录，执行以下命令：  
   ```bash
   sudo chmod +x T3568_gpio_test.sh
   sudo ./T3568_gpio_test.sh
   ```

3. 测试成功输出示意：  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-3.png)

---

## 13. COM  

1. 接入 COM loop 测试线，使用脚本进行回环测试  

COM1 治具定义：  
- 短接 TX 与 RX  
  ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-4.png)

COM2-COM6 治具定义：  
- 短接 pin2 与 pin3  
  ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image-1.png)

2. 打开终端，进入脚本所在目录，执行以下命令：  
   ```bash
   sudo python3 T3568_uart_test.py
   ```

3. 测试成功输出示意：  
   ![alt text](/assets/images/测试sop/hw-t3568i-ubuntu-接口测试/image.png)

---
