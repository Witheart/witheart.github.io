---
title: "使用 iPerf3 测试 ARM 主板的网络性能"
date: 2026-04-22
last_modified_at: 2026-04-22
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/使用-iperf3-测试-arm-主板的网络性能/
toc: true
---

以下是通过 **iPerf3** 测试 ARM 主板网络性能的完整流程，适用于 ARM 主板与 Win10 发包主机在同一局域网内的情况。


## 修改历史

| 时间     | 历史                         |
| -------- | ---------------------------- |
| 20241213 | 创建了本文                   |
| 20260422 | 加入了指定网络端口的参数说明 |

## **一、连接方式**

1. 将待测试的 **ARM 主板** 和 **Win10 发包主机** 通过网线连接到同一局域网。
2. 确保两者可以互相 **Ping 通**。

---

## **二、软件准备**

- **ARM 主板**：
  - 通常自带 `iperf3` 工具，无需额外安装。
- **Win10 发包主机**：
  - 前往 [https://iperf.fr/iperf-download.php](https://iperf.fr/iperf-download.php) 下载对应的 Windows 版本。
  - 解压后即可使用。

---

## **三、测试步骤**

### **1. Win10 发包主机：启动 iPerf3 服务**

1. 打开 **CMD**。
2. 查看 Win10 主机的 IP 地址并记录：
   ```bash
   ipconfig
   ```
   例如，IP 地址为 `192.168.0.102`。
3. 启动 iPerf3 服务端，运行以下命令：
   ```bash
   iperf3.exe -s
   ```
   输出如下内容表示服务端正在监听：
   ```
   -----------------------------------------------------------
   Server listening on 5201 (test #1)
   -----------------------------------------------------------
   ```

### **2. ARM 主板：运行 iPerf3 客户端**

1. 登录 ARM 主板终端。
2. 执行以下命令启动测试：

   ```bash
   iperf3 -c 192.168.0.102
   ```

   > 注意：将 `192.168.0.102` 替换为 Win10 发包主机的实际 IP 地址。

3. 测试开始后，终端会输出结果。

4. 使用 -B 可以指定IP，适用于多网口设备

```bash
# iperf3 -c 192.168.137.1 -B 192.168.137.100

Connecting to host 192.168.137.1, port 5201

```

5. 使用 --bind-dev 可以指定网口设备，也适用于多网口设备，无需查询网口实际IP（适用于iperf 3.10 或更高版本）

```bash
# iperf3 -c 192.168.137.1 --bind-dev eth0
Connecting to host 192.168.137.1, port 5201
[  5] local 192.168.137.100 port 40476 connected to 192.168.137.1 port 5201

```

---

## **四、测试结果示例**

以下是实际测试的输出结果：

```plaintext
rk3568_HW:/ $ iperf3 -c 192.168.0.102
Connecting to host 192.168.0.102, port 5201
[  5] local 192.168.0.107 port 54768 connected to 192.168.0.102 port 5201
[ ID] Interval           Transfer     Bitrate         Retr  Cwnd
[  5]   0.00-1.00   sec   114 MBytes   959 Mbits/sec    0    462 KBytes
[  5]   1.00-2.00   sec   113 MBytes   950 Mbits/sec    0    462 KBytes
[  5]   2.00-3.00   sec   113 MBytes   949 Mbits/sec    0    486 KBytes
[  5]   3.00-4.00   sec   112 MBytes   942 Mbits/sec    0    538 KBytes
[  5]   4.00-5.00   sec   113 MBytes   948 Mbits/sec    0    565 KBytes
[  5]   5.00-6.00   sec   113 MBytes   951 Mbits/sec    0    595 KBytes
[  5]   6.00-7.00   sec   113 MBytes   945 Mbits/sec    0    595 KBytes
[  5]   7.00-8.00   sec   114 MBytes   953 Mbits/sec    0    595 KBytes
[  5]   8.00-9.00   sec   112 MBytes   942 Mbits/sec    0    624 KBytes
[  5]   9.00-10.00  sec   114 MBytes   954 Mbits/sec    0    624 KBytes
- - - - - - - - - - - - - - - - - - - - - - - - -
[ ID] Interval           Transfer     Bitrate         Retr
[  5]   0.00-10.00  sec  1.11 GBytes   949 Mbits/sec    0             sender
[  5]   0.00-10.00  sec  1.10 GBytes   948 Mbits/sec                  receiver

iperf Done.
```

---

## **五、结果保存**

1. 将测试结果复制并保存为一个 `.txt` 文件。
2. **可选**：使用 `iperf3结果快速保存工具.html`，以更方便的方式保存结果，具体操作方式查看对应工具的使用说明。

---

## **六、重复测试**

对其他网络接口重复上述步骤，完成所有接口的网络性能测试。

## **七、结果解读**

如果需要解读结果，可以使用`iperf3_compare_tool.html`工具进行多个结果的txt文件进行对比，具体操作方式查看对应工具的使用说明。
