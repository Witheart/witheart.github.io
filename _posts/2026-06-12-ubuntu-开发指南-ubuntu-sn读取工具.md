---
title: "Ubuntu SN读取工具"
date: 2026-06-12
last_modified_at: 2026-06-12
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-sn读取工具/
toc: true
---

## 一、 脚本核心逻辑解析

**1. 设备类型动态识别**

```bash
model_info=$(tr -d '\0' < /proc/device-tree/model 2>/dev/null)

if echo "$model_info" | grep -qi "rk3568"; then
    i2c_bus=5
elif echo "$model_info" | grep -qi "rk3588"; then
    i2c_bus=6

```

- **逻辑**：嵌入式 Linux 启动时，会将硬件描述信息（设备树）映射到内存中。脚本通过读取 `/proc/device-tree/model` 获取主板的具体型号。
- **细节**：使用 `tr -d '\0'` 是为了抹掉 C 语言字符串结尾的不可见空字符，防止 Bash 报“忽略输入中的 null 字节”的警告。然后通过 `grep -qi` 忽略大小写去匹配关键字，从而动态决定该用 I2C 的第 5 条还是第 6 条总线。

**2. I2C 底层数据提取**

```bash
raw_data=$(i2ctransfer -y -f "$i2c_bus" w2@0x57 0x10 0x00 r30 2>/dev/null)

```

- **逻辑**：调用 Linux 标准的 I2C 工具集直接与 EEPROM 芯片对话。
- **参数解析**：
- `-y`：跳过交互式确认，直接执行。
- `-f`：强制访问（即使该设备正被内核其他驱动占用）。
- `w2@0x57`：向 I2C 从设备地址 `0x57` 写入 2 个字节。
- `0x10 0x00`：写入的具体内容，通常代表要读取的起始寄存器地址。
- `r30`：紧接着从该地址连续读取 30 个字节的数据。

**3. Hex 到 ASCII 字符解析 (翻译)**

```bash
for hex in $raw_data; do
    if [ "$hex" = "0x00" ]; then break; fi
    char=$(printf "\\x${hex#0x}")
    sn="${sn}${char}"
done

```

- **逻辑**：`i2ctransfer` 返回的都是诸如 `0x54 0x33 0x35...` 这样的十六进制原始数据。脚本使用 `for` 循环逐个处理。
- **细节**：
- **截断机制**：一旦读到 `0x00`（ASCII 里的 NUL，通常表示字符串结束），就立刻 `break` 跳出循环，忽略后面的无效乱码。
- **字符转换**：`${hex#0x}` 去掉 `0x` 前缀，拼成 `\x54` 这种格式，然后利用 `printf` 命令的特性，将其直接“翻译”成人类可读的字母或数字（例如 0x54 对应 'T'）。

---

- 部署到 `/usr/local/bin/`
