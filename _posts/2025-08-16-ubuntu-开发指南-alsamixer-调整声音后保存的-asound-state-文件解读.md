---
title: "alsamixer 调整声音后保存的 asound.state 文件解读"
date: 2025-08-16
last_modified_at: 2025-08-16
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/alsamixer-调整声音后保存的-asound-state-文件解读/
toc: true
---

## asound.state 文件的生成与加载

一般情况下，会使用下面的方式保存和加载音量的配置

- 打开 alsamixer 并设置音量

```sh
alsamixer
```

- 调整后 ESC 退出，然后保存当前设置

```sh
sudo alsactl store -f /var/lib/alsa/asound.state
```

- 尝试加载配置

```sh
sudo alsactl restore -f /var/lib/alsa/asound.state
```

## 解读

/var/lib/alsa/asound.state 这个文件就保存着声音配置的细节，使用 cat 查看，可以看到类似于下面的字段

```ini
control.12 {
        iface MIXER
        name 'Headphone Playback Volume'
        value.0 3
        value.1 3
        comment {
                access 'read write'
                type INTEGER
                count 2
                range '0 - 3'
                dbmin -4800
                dbmax 0
                dbvalue.0 0
                dbvalue.1 0
        }
}
```

1.  **控制项定义（硬件能力）：**

    - `iface MIXER`: 表明这是混音器控制项。
    - `name 'Headphone Playback Volume'`: 控制项的名称 (即 alsamixer 里看到的标签)。
    - `comment { ... }`: 内嵌注释详细描述了控制项的**硬件能力**：
      - `access 'read write'`: 可读写。
      - `type INTEGER`: 整数类型控制 (音量滑块)。
      - `count 2`: 有 2 个通道 (立体声，左声道和右声道)。
      - `range '0 - 3'`: 硬件允许的音量取值范围 (最小 0, 最大 3)。
      - `dbmin -4800`, `dbmax 0`: 对应的分贝范围 (以百分之一 dB 为单位, 即 -48dB 到 0dB)。
      - `dbvalue.0 0`, `dbvalue.1 0`: **注意，`dbvalue` 在 `comment` 里描述的是范围，不是当前值！它告诉你 dB 计算比例：`value=0` 对应 `dbmin=-4800`，`value=3` 对应 `dbmax=0`**。
    - 这是**内核驱动根据声卡硬件 (编解码器) 规格探测和定义的**，基本固定，反映硬件能力。

2.  **控制项的当前值：**
    - `value.0 3`, `value.1 3`: **这是最重要的信息！这表示硬件寄存器当前的音量值是 3 。**
    - 这个当前值 (`value.0` 和 `value.1`) 是由：
      - 驱动初始加载时设置的 **内核驱动默认值** (可能由驱动代码硬编码或基于探测结果)。
      - **OR** 由 `alsactl restore` 等工具从保存的文件 (如 `/etc/asound.state` 或 `/var/lib/alsa/asound.state`) 中恢复的值。
    - **这就是你在 `alsamixer` 里看到的那个滑块当前所在的位置。**
