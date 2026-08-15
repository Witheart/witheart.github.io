---
title: "Ubuntu debug 系统信息及日志捕捉脚本设计文档"
date: 2026-05-21
last_modified_at: 2026-05-21
categories:
  - "Ubuntu 调试"
tags:
  - "Ubuntu 调试"
permalink: /ubuntu-调试/ubuntu-debug-系统信息及日志捕捉脚本设计文档/
toc: true
---

- **项目名称**：RK3568/RK3588 Ubuntu 一键调试信息与日志捕捉系统
- **目标平台**：搭载 Ubuntu 系统的 RK3568/RK3588 终端设备

## 一、 系统级运行逻辑与核心策略

### 1. 权限强校验机制

脚本运行初期检查有效用户ID（EUID）。若非 root 用户（EUID不等于0），则拒绝执行并提示加 `sudo` 重新运行。确保脚本具备读取总线外设、内核时钟树及系统日志的必要权限。

### 2. 参数解析与帮助手册

脚本支持标准参数输入，并内置命令解析：

- `-h` / `--help`：输出参数使用说明、功能简介及运行示例，随后正常退出。
- `-i` / `--ignore`：跳过工具链缺失检查，允许在无网环境中强行运行。
- `-j [数字]`：覆盖默认参数，指定需要导出的历史开机日志（Boot）数量（默认值为10）。

### 3. 工具链依赖性诊断与安装提示

脚本检查执行所需的必要命令（i2ctransfer, zip, top, iostat, journalctl, awk, sed, grep, xrandr, tr）。若存在缺失，脚本通过内置的哈希表将缺失命令映射为具体的 Ubuntu 软件包名称（如 `xrandr` 对应 `x11-xserver-utils`），并在终止运行时为用户拼接输出标准的软件包安装命令。

### 4. 设备树读取与空字符清洗

脚本通过读取 `/sys/firmware/devicetree/base/model` 节点判定当前硬件架构（RK3568 或 RK3588）。由于设备树节点末尾包含标准 Null 字节（`\0`），直接读取会触发 Bash 命令替换警告。设计采用 `tr -d '\0'` 过滤空字符，实现无警告的芯片型号判定。根据判定结果，RK3568 路由至 I2C-5 总线寻址，RK3588 路由至 I2C-6 总线寻址。

### 5. 硬件 SN 码状态机解析与结束符截断

脚本通过 I2C 总线从 `0x57` 地址读取偏移量为 `0x10 0x00` 的 30 字节原始十六进制硬件编码。在 Shell 循环解析中建立字节级状态机：

- 当遍历到 `0x00` 时，判定为 C 语言字符串结束符（`\0`），立刻强行终止（`break`）后续字节的解析，丢弃尾部无效的填充数据。
- 过滤非可见字符与 `0xff`，仅允许 ASCII 码值在 32 至 126 之间的有效打印字符进行拼接，以此生成无乱码的物理 SN 字符串。

---

## 二、 调试信息分层清单设计（独立文件存储架构）

为便于数据比对与多维分析，采集信息不再合并，全部按层级输出为独立的文本或日志文件。

### 1. 第一层：OS 基础与环境层 (OS & Environment)

主要确认操作系统版本、存储健康度、屏幕拓扑架构与板级凭证。

- `layer1_uname.txt`：内核版本与编译信息（`uname -a`）。
- `layer1_os_release.txt`：系统发行版版本标识（`cat /etc/os-release`）。
- `layer1_buildinfo.txt`：根文件系统构建信息（`cat /etc/buildinfo`）。
- `layer1_raw_sn_hex.txt`：通过 I2C 读取的 30 字节裸十六进制码。
- `layer1_parsed_sn_ascii.txt`：经状态机截断、清洗后还原的物理 SN 字符串。
- `layer1_disk_usage.txt`：各分区磁盘空间使用率（`df -h`）。
- `layer1_mount_status.txt`：确认分区挂载读写属性，排查文件系统是否变为只读（`mount`）。
- `layer1_machine_id.txt`：Systemd 系统唯一散列标识（`cat /etc/machine-id`）。
- `layer1_dri_summary.txt`：显卡底层框架及显存分配快照（`cat /sys/kernel/debug/dri/0/summary`）。
- `layer1_xrandr_display.txt`：显示设备连接状态、支持的分辨率以及 EDID 数据（`xrandr --verbose`）。

### 2. 第二层：Rockchip 独有硬件层 (RK Hardware)

监控瑞芯微特有硬件加速器与片上系统物理指标。

- `layer2_cpu_freq.txt`：轮询各核心实时运行频率（`scaling_cur_freq`）。
- `layer2_thermal_zone.txt`：提取片上系统各热敏点的实时温度（`thermal_zone*/temp`）。
- `layer2_gpu_freq.txt`：图形处理器实时工作频率（`*gpu/cur_freq`）。
- `layer2_ddr_freq.txt`：内存频率动态自适应抓取。RK3588 优先读取 `/sys/class/devfreq/dmc/cur_freq`；若节点缺失（如 RK3568 平台），自动降级读取内核底层时钟树 `/sys/kernel/debug/clk/clk_summary` 并过滤 `ddr` 关键字获取实时频率。
- `layer2_rknpu_load.txt`：神经网络处理器（NPU）的实时核心负载与内存分配（`/sys/kernel/debug/rknpu/load`）。

### 3. 第三层：内核与底层总线层 (Kernel & Bus)

捕捉最底层Panic崩溃信号以及核心外设总线状态。

- `layer3_dmesg.log`：带有绝对时间戳的内核环形缓冲区历史日志（`dmesg -T`）。
- `layer3_lspci.txt`：PCIe 设备枚举列表与底层链路状态，用于诊断 PCIe 固态硬盘或网卡稳定性（`lspci -v`）。
- `layer3_lsusb.txt`：USB 接口外设挂载状态（`lsusb`）。
- `layer3_interrupts.txt`：系统中断分配及触发频率，分析是否存在硬件中断风暴（`cat /proc/interrupts`）。

### 4. 第四层：系统资源与网络层 (Resources & Network)

排查常规的内存泄漏、网络掉线与磁盘死锁。

- `layer4_free_m.txt`：物理内存宏观分配快照（`free -m`）。
- `layer4_meminfo.txt`：详细的内核内存堆栈分配指标（`cat /proc/meminfo`）。
- `layer4_cma_info.txt`：连续内存分配（CMA）剩余情况。由于 MPP 多媒体解码与摄像头强依赖大块物理内存，专门过滤此指标。
- `layer4_file_handles.txt`：系统全局打开的文件句柄数，防范文件句柄泄漏（`cat /proc/sys/fs/file-nr`）。
- `layer4_ip_address.txt` / `layer4_ip_route.txt`：网卡 IP 配置与系统全局路由表。
- `layer4_network_connections.txt`：套接字状态与通信端口占用情况（依据环境选择 `ss -antp` 或 `netstat -anp`）。
- `layer4_top_processes.txt`：兼容标准 procps 库及 BusyBox 语法，获取占用系统资源前 40 名的进程列表（`top -b -n 1`）。
- `layer4_iostat.txt`：采集高精度的磁盘扩展 I/O 状态，用于判断应用层是否因死循环刷写导致系统陷入不可中断的 D 状态死锁（`iostat -x 1 2` 的第二次输出）。

### 5. 第五层：业务与应用层 (Systemd Journalctl 级联检索)

提取应用层及系统服务的历史运行日志。
在日志临时目录下划设专有文件夹 `journalctl/`：

- `boot_list.txt`：导出完整的开机序号与对应时间大盘（`journalctl --list-boots`）。
- 容错处理：动态解析实际总开机日志份数，并与预期抓取数（如10）做交集，限制最大循环上限，杜绝无效空循环。
- 日志分块：利用步进循环，将当前周期（0）、上一次开机周期（-1）按指定上限由新到旧逐个导出，剥离时间戳美化命名（如 `boot_-1_20260520_183012.log`），实现独立开机周期的日志解耦。

---

## 三、 归档、加密与资源清理策略

1. **扁平化压缩归档**：脚本临时数据存放在 `/tmp/log-[SN]-[时间戳]` 下。压缩时切入 `/tmp` 相对路径执行，防止将系统的绝对路径层级打包进文件，保证解压后直接暴露出分层独立小文件。
2. **高强度内容加密**：强制在打包阶段启用标准 AES 加密，压缩包解压密码设定为：`Pi3.14159`，防止设备的商业运行日志及核心业务明文外泄。
3. **零残留原子清理**：当 `zip` 命令确认成功返回状态码 0 后，立即调用 `rm -rf` 擦除临时生成的未压缩散碎目录。在保证不给存储紧张的嵌入式板卡闪存留下任何临时文件的前提下，最终仅在 `/tmp` 目录下保留一个高压缩比的加密 `.zip` 文件。
4. **终端交付反馈**：脚本退出前，向控制台统一打印提示块，明示最终压缩包的绝对路径、解压密码，并提示非研发人员将该压缩包拷贝并回传给研发人员进行问题深度分析。
