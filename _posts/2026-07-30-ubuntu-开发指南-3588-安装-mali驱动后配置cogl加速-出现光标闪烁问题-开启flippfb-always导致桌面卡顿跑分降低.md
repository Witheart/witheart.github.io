---
title: "3588 安装 mali驱动后配置cogl加速 —— 出现光标闪烁问题（开启FlippFB always导致桌面卡顿跑分降低）"
date: 2026-07-30
last_modified_at: 2026-07-30
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/3588-安装-mali驱动后配置cogl加速-出现光标闪烁问题-开启flippfb-always导致桌面卡顿跑分降低/
toc: true
---

## 问题描述

RK3588 部署mali驱动后（安装deb包，设置COGL_DRIVER=gles2），桌面运行流畅，glmark-es2跑分也在正常的八百多。但是发现光标闪烁问题，如下
<video controls src="video(18).mp4" title="Title"></video>

这个问题可以使用`/etc/X11/xorg.conf.d/20-modesetting.conf`中的 `FlipFB=always` 解决，但是会导致 glmark2-es2 跑分从约 900 FPS 骤降至 300~400 FPS（性能损失约 50%），光标移动有明显的不流畅现象。

最后发现是需要配置ASYNC_COMMIT=1来解决这个问题。

| 配置                               | 跑分          | 显示质量         |
| ---------------------------------- | ------------- | ---------------- |
| `FlipFB=none`                      | ~900 FPS 正常 | 光标闪烁、撕裂   |
| `FlipFB=always`                    | ~300 FPS 异常 | 无撕裂、光标正常 |
| `FlipFB=always` + `ASYNC_COMMIT=1` | ~900 FPS 正常 | 无撕裂、光标正常 |

## 根本原因

### 1 核心机制

- **1. 单缓冲渲染与数据冲突（FlipFB=none）**
  在默认状态下，图形管线采用单缓冲渲染（Front Buffer Rendering）。GPU（渲染核心）和 VOP（显示控制器）共享同一块显存区域。GPU 的光栅化写入操作与显示器的逐行扫描（Scanout）操作同时且异步进行。由于缺乏同步锁，屏幕扫描时极易跨越帧边界，读取到前后两帧混合的脏数据（Dirty Data），在视觉上表现为画面撕裂（Tearing）和光标图层闪烁。
- **2. 双缓冲机制与管线阻塞（FlipFB=always + ASYNC_COMMIT=0）**
  开启 `FlipFB` 后，系统引入了双缓冲（Double Buffering）与页面翻转（Page Flip）机制。GPU 强制在后台缓冲区（Back Buffer）渲染，完成后向 DRM（Direct Rendering Manager）发起页面翻转请求。但由于新内核默认配置为**同步提交**，整个渲染管线会被挂起（Blocked）：GPU 必须强制空转等待下一个 Vblank（垂直消隐区）信号，直到缓冲区指针交换完成，才能开始下一帧渲染。这导致 GPU 的渲染流水线被显示刷新率强行节流，利用率暴跌，帧率测试腰斩。
- **3. 邮箱模式与无阻塞渲染（FlipFB=always + ASYNC_COMMIT=1）**
  引入 `ASYNC_COMMIT=1` 后，DRM 解除了对用户态提交的阻塞限制。渲染管线实际上升级为了类似于三重缓冲的“邮箱模式（Mailbox Presentation）”。GPU 渲染完后台缓冲区后发起**异步提交**，无需等待 Vblank 即可立即复用空闲显存开启下一帧的渲染。若在单个 Vsync 周期内产生多个成帧，DRM 会自动丢弃（Drop）旧帧，仅保留最新的帧指针。这既保证了上屏画面的原子性（消除撕裂），又彻底释放了 GPU 的极限吞吐量。

---

### 2 “画师与观众”的类比

在这套底层架构里，咱们可以这样设定角色：

- **GPU** = 疯狂的画师
- **显存（Buffer）** = 画布
- **VOP（显示控制器）/ 显示器** = 按时检阅的观众
- **Vsync（垂直同步信号）** = 固定的画展开放时间（比如每秒开放 60 次）

咱们把场景重构一下：

**场景一：露天作画（未开 FlipFB）**
画师直接在展厅正中央的墙上（单缓冲）作画，观众同时也在看。画师手速太快，经常是观众眼睛从上往下刚扫到一半，画师已经把下半幅涂成了新的一张图。观众看到的永远是“上半截旧画、下半截新画”的拼接怪，画面直接“撕裂”了。

**场景二：死板的后台工作室（FlipFB=always，ASYNC=0）**
为了保护观众体验，画师搬到了后台工作室（开启双缓冲），画好一幅完整的画后，送到展厅。但展厅有个死规矩：**必须等观众看完了、把画撤下来，才准画师回去画下一张。** 结果画师一身的本事，大部分时间全在走廊里傻站着等观众，产量（跑分）直接缩水一半。

**场景三：带有投递箱的疯狂工作室（FlipFB=always，ASYNC=1）**
展厅门口多了一个“最新画作投递箱”（邮箱机制）。画师在后台疯狂作画，画完一幅就塞进箱子里，**转头立刻回去画下一张，绝不傻等**。如果画师画得太快，观众还没来得及看，画师就直接把箱子里的旧画抽出来丢进废纸篓，永远只把最新的一幅放进去。
当观众按着自己的节奏准时来看时，拿到的永远是箱子里最新、最完整的那幅画。画师爽了（性能拉满），观众也爽了（画面完美不撕裂）。

```
同步提交 (ASYNC_COMMIT=0, 默认):
帧1渲染完成 → 等待vsync → 提交 → 帧2渲染 → 等待vsync → 提交
  GPU在等待间隙空转，FlipFB=always下性能损失约50%

异步提交 (ASYNC_COMMIT=1):
帧1渲染完成 → 立即提交 → 帧2渲染 → 立即提交
  GPU不等待，FlipFB+page flip保证无撕裂，性能无损失
```

`FlipFB=always` + `ASYNC_COMMIT=1` 的组合是**两把锁**：

| 组件             | 作用                          | 缺少后果            |
| ---------------- | ----------------------------- | ------------------- |
| `FlipFB=always`  | 使用 page flip 路径，消除撕裂 | 缺少则撕裂+光标闪烁 |
| `ASYNC_COMMIT=1` | 解除 vsync 等待，恢复性能     | 缺少则性能损失 50%  |

两者**缺一不可**。

## 解决方案

将提到的4个必须的文件放入板子目标路径中：
| SDK 源路径 | 板子目标路径 | 必须 |
| --------------------------------------------------------------- | ----------------------- | :--: |
| `debian/overlay/etc/X11/xorg.conf.d/20-modesetting.conf` | `/etc/X11/xorg.conf.d/` | ✓ |
| `debian/overlay/etc/init.d/S10atomic_commit.sh` | `/etc/init.d/` | ✓ |
| `device/rockchip/common/tools/aarch64/modetest` | `/usr/bin/` | ✓ |
| `debian/overlay/usr/lib/systemd/system/async.service` | `/lib/systemd/system/` | ✓ |
| `debian/overlay/etc/profile.d/gst.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/profile.d/qt.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/profile.d/qtwebengine.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/profile.d/cogl.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/profile.d/x11.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/profile.d/common-env.sh` | `/etc/profile.d/` | 可选 |
| `debian/overlay/etc/udev/rules.d/99-rockchip-permissions.rules` | `/etc/udev/rules.d/` | 推荐 |
| `debian/overlay/etc/X11/Xsession.d/98x11-common_env` | `/etc/X11/Xsession.d/` | 推荐 |
| `debian/overlay/etc/X11/Xsession.d/36x11-common_xhost-root` | `/etc/X11/Xsession.d/` | 推荐 |
| `debian/overlay/etc/init.d/rockchip.sh` | `/etc/init.d/` | 推荐 |

> 标注"必须"的 4 个文件是解决本问题的核心。其余文件为 RK SDK 配套环境配置，建议一并部署。

- 还需执行以下的命令

```bash
systemctl enable async.service
chmod +x /etc/init.d/S10atomic_commit.sh
chmod +x /usr/bin/modetest
```

## 常见踩坑

1. **忘记链接 runlevel / 启用 service**：只放 `/etc/init.d/` 不会自动执行。systemd 系统必须 `systemctl enable async.service`，SysV 系统必须链接到 `/etc/rcS.d/`。
2. **systemd 系统用了 rcS.d 方式**：`/etc/rcS.d/` 软链接在 systemd 上**不会被执行**（`rc-local.service` 只跑 `/etc/rc.local`）。必须用 `async.service`。
3. **部署后未重启显示管理器**：即使脚本执行了，FlipFB 配置需要重启 lightdm/gdm 才能生效。简单方案：直接 `reboot`。
4. **缺 `modetest`**：`S10atomic_commit.sh` 依赖 `modetest`，缺少则脚本跳过不报错。
5. **只改 xorg.conf**：仅靠 `FlipFB=always` 不加 `ASYNC_COMMIT` 是性能杀手。
6. **混淆 xorg.conf 版本**：必须使用 SDK 完整版（含 `NoEDID`、`UseGammaLUT`、`Screen`、`Monitor` 段），仅含 `Device` 段的最小化配置不可靠。

## 验证方法

在桌面终端执行：

```bash
glmark2-es2
```

预期结果：FPS 应达到 **800~900+**，光标不闪烁，画面无撕裂。

## 文件内容

- `debian/overlay/etc/X11/xorg.conf.d/20-modesetting.conf`

```conf
Section "Device"
    Identifier  "Rockchip Graphics"
    Driver      "modesetting"

### Use Rockchip RGA 2D HW accel
#    Option      "AccelMethod"    "exa"

### Use GPU HW accel
    Option      "AccelMethod"    "glamor"

    Option      "DRI"            "2"

### Set to "always" to avoid tearing, could lead to up 50% performance loss
    Option      "FlipFB"         "always"

### Limit flip rate and drop frames for "FlipFB" to reduce performance lost
#    Option      "MaxFlipRate"    "60"

    Option      "NoEDID"         "true"
    Option	"UseGammaLUT"	 "true"
EndSection

Section	"Screen"
    Identifier	"Default Screen"
    Device	"Rockchip Graphics"
    Monitor	"Default Monitor"
EndSection

### Valid values for rotation are "normal", "left", "right"
Section	"Monitor"
    Identifier	"Default Monitor"
    Option	"Rotate" "normal"
EndSection
```

- `debian/overlay/etc/init.d/S10atomic_commit.sh`

```sh
#!/bin/bash -e
### BEGIN INIT INFO
# Provides:          S10atomic_commit
# Required-Start:
# Required-Stop:
# Default-Start:
# Default-Stop:
# Short-Description:
# Description:       Setup enable async for display
### END INIT INFO
#
# For new rockchip BSP kernel only.
# Enable ASYNC_COMMIT by default to keep the same behavior as the old
# BSP 4.4 kernel.
#

which modetest || exit 0

case "$1" in
	start)
		for p in $(modetest|grep "^Planes:" -A 9999|grep -o "^[0-9]*");
		do
			modetest -M rockchip -aw $p:ASYNC_COMMIT:1 &>/dev/null
		done
		;;
	stop)
		;;
	restart|reload)
		;;
	*)
		echo "Usage: $0 {start|stop|restart}"
		exit 1
esac

exit $?

```

- `device/rockchip/common/tools/aarch64/modetest`
  二进制文件

- `debian/overlay/usr/lib/systemd/system/async.service`

```txt
[Unit]
Description=enable ASYNC for Debian Display
Before=rockchip.service

[Service]
Type=forking
ExecStart=/etc/init.d/S10atomic_commit.sh start
ExecStop=/etc/init.d/S10atomic_commit.sh stop
ExecReload=/etc/init.d/S10atomic_commit.sh reload

[Install]
WantedBy=multi-user.target
```
