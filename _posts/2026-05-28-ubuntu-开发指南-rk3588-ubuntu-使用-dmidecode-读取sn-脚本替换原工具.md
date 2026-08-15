---
title: "rk3588 Ubuntu 使用 dmidecode 读取SN —— 脚本替换原工具"
date: 2026-05-28
last_modified_at: 2026-05-28
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/rk3588-ubuntu-使用-dmidecode-读取sn-脚本替换原工具/
toc: true
---

在ARM架构（如RK3588）的Linux系统中，默认通常使用设备树（Device Tree）而不是传统的x86 ACPI/SMBIOS。因此，标准的 `dmidecode` 找不到 SMBIOS 节点，就会报 `No SMBIOS nor DMI entry point found` 的错误。

## 方案：使用 Shell 脚本替换替换 `dmidecode`

我们可以把原本的 `dmidecode` 二进制文件重命名备份，然后在这个位置放置一个同名的 Shell 脚本。当脚本检测到正在查询 SN 时，就后台执行 `i2ctransfer` 并将16进制的ASCII码转换打印出来；如果查询别的参数，就交给真正的 `dmidecode` 去处理。

**1. 备份原生的 dmidecode**

```bash
sudo mv /usr/sbin/dmidecode /usr/sbin/dmidecode.real
```

**2. 创建 Wrapper 脚本**
使用文本编辑器创建新的 `dmidecode` 文件：

```bash
sudo nano /usr/sbin/dmidecode
```

将以下脚本内容粘贴进去：

```bash
#!/bin/bash

# 判断是否是指定的查询 SN 的指令
if [ "$1" = "-s" ] && [ "$2" = "system-serial-number" ]; then
    
    # 提取 I2C 中的原始 Hex 数据 (屏蔽错误输出)
    raw_data=$(i2ctransfer -y -f 6 w2@0x57 0x10 0x00 r30 2>/dev/null)
    
    sn=""
    # 遍历读取到的每一个字节
    for hex in $raw_data; do
        # 遇到 0x00 代表字符串结束，跳出循环
        if [ "$hex" = "0x00" ]; then
            break
        fi
        
        # 将 0xXX 转换为 ASCII 字符
        # 去掉 '0x' 前缀并组合成 \xXX 格式供 printf 转换
        char=$(printf "\\x${hex#0x}")
        sn="${sn}${char}"
    done
    
    # 输出最终的 SN
    echo "$sn"
    exit 0
fi

# 如果传入了其他参数，则调用原始的 dmidecode 命令
exec /usr/sbin/dmidecode.real "$@"
```

**3. 赋予脚本执行权限**

```bash
sudo chmod +x /usr/sbin/dmidecode
```

**4. 验证测试**
现在，直接运行要求的命令：

```bash
sudo dmidecode -s system-serial-number
```
