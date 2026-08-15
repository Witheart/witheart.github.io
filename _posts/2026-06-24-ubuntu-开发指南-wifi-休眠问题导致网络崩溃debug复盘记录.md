---
title: "WiFi 休眠问题导致网络崩溃debug复盘记录"
date: 2026-06-24
last_modified_at: 2026-06-24
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/wifi-休眠问题导致网络崩溃debug复盘记录/
toc: true
---

## 1 问题描述

rk3588，使用cm256 sdio wifi，Ubuntu20.04，运行一段时间后设置中NetworkManager显示出错，WiFi项消失。

- ip iwconfig ifconfig等命令，敲入后无响应卡住
- 使用sudo命令，也卡住

## 2 排查过程

### 2.1 情况了解

- htop，发现cpu和内存占用不高，但是有多个systemd-resolved进程，且都为D状态
- 查看journalctl日志，发现有DNS降级日志，客户软件心跳断联日志，wifi sdio_bus sleep错误日志

```bash
brcmf_sdio_bus_sleep: error while changing bus sleep state -110
brcmf_sdio_dpc: sdio ctrlframe tx failed err=-110
brcmf_sdio_dpc: failed backplane access over SDIO, halting operation
```

日志中没有明确网络崩溃原因的指示，只能先尝试复现，再做一些验证。

### 2.2 实验

核心是尽量模拟环境，尝试复现；并做一些猜测的验证，看能否解决问题

1. 问题环境下（WiFi/todesk/客户软件/DNS），安排多台尝试复现，有复现频率较高的
2. 关闭WiFi
3. 关闭WiFi休眠省电
4. 更改DNS

### 2.3 补充点

iwconfig，看到出问题的机器，重传次数较多；ifconfig中，看到error较多。

### 2.4 抓日志

复现到一台机器，在不重启的情况下，尝试抓更多日志。主要是列出D进程的调用栈，参考《出现D状态进程（不可中断睡眠）调试 —— 信息收集.md》

与此同时，发现关闭WiFi休眠省电有改善，一个是重传次数变少，另一个是error次数变少。继续按此方式测试。

## 3 日志分析

### 3.1 涉及的两种锁

#### 3.1.1 **MMC Host 睡眠锁**（等待队列 + 自旋锁组合）

`__mmc_claim_host` 使用的是一种 **自定义的睡眠锁（Sleep Lock）**，不是标准的 mutex，而是：

- **等待队列 (wait_queue_head_t)** `host->wq` — 用于进程睡眠/唤醒
- **自旋锁 (spinlock_t)** `host->lock` — 保护 `claimed`/`claimer` 标志位
- 进程状态设为 **`TASK_UNINTERRUPTIBLE`** (不可中断睡眠)

这叫 **"基于等待队列的独占睡眠锁"（Wait-queue-based Exclusive Sleep Lock）**。它是 Linux MMC 子系统中特有的设计，因为 SDIO 操作耗时较长，不适合用自旋锁忙等，也不能被信号中断。

#### 3.1.2 **RTNL 互斥锁 (rtnl_lock)**

Linux 网络栈的全局大锁，类型是 **`struct mutex`**。任何操作网络设备（注册/注销网卡、修改 IP、查看网络状态）都需要持有它。

---

### 3.2 锁链的精确传播路径

```
层级 1: kworker/u17:0 (pid:2997694) — 原始持有者
  Workqueue: brcmf_wq/mmc2:0001:1  brcmf_sdio_dataworker
  状态: D — 卡在 wait_for_completion (mmc_wait_for_req_done)
  ↓
  这个 kworker 是 brcmfmac 的数据路径线程，负责通过 SDIO 发送数据。
  它调用了 sdio_memcpy_toio → mmc_io_rw_extended → mmc_wait_for_req →
  wait_for_completion，正在等待 MMC 硬件完成一次 SDIO 写操作。

  但此时 SDIO 硬件已经超时/卡死，这个 completion 永远不会到来。

  **关键：这个 kworker 是在 brcmf_wq/mmc2:0001:1 workqueue 中执行的，
  它在调用 sdio_memcpy_toio 之前，已经通过 sdio_claim_host 持有了
  mmc_host 的独占锁！**
```

```
层级 2: NetworkManager (pid:2934884) — 第一级阻塞者
  状态: D — 卡在 __mmc_claim_host → sdio_claim_host
  wait-time: 17629 秒 (约 4.9 小时!)
  ↓
  NetworkManager 调用 nl80211_get_station 查询 WiFi 信号状态
  → brcmf_cfg80211_get_station → brcmf_fil_iovar_data_get
  → brcmf_proto_bcdc_query_dcmd → brcmf_proto_bcdc_msg
  → brcmf_sdio_bus_txctl → **sdio_claim_host**

  它需要获取 mmc_host 锁才能通过 SDIO 向芯片发送命令，
  但这个锁正被 kworker/u17:0 持有，且 kworker 永远等不到硬件完成。

  → NetworkManager 永久卡死在 sdio_claim_host 上
```

```
层级 3: kworker/3:0 (pid:2997274) — 第二级阻塞者
  Workqueue: ipv6_addrconf  addrconf_verify_work
  状态: D — 卡在 rtnl_lock (mutex_lock)
  wait-time: 195.8 秒
  ↓
  addrconf_verify_work 是 IPv6 地址有效性检查的内核定时任务。
  它需要 rtnl_lock 来检查/修改 IPv6 地址状态。

  但 rtnl_lock 被谁持有？—— 很可能是 NetworkManager 或其他网络操作。
  实际上，由于整个网络栈在处理 wlan0 相关操作时都可能在某个路径上
  间接等待 SDIO 响应，rtnl_lock 的持有者也被间接阻塞了。
```

```
层级 4: cups-browsed, bwrap, 以及其他进程
  状态: D — 卡在 rtnl_lock / __netlink_dump_start
  ↓
  任何需要 rtnl_lock 的操作（ifconfig、ip link、netstat 等）
  全部阻塞。甚至创建新网络命名空间（clone/unshare）也会卡在
  register_netdev → rtnl_lock。
```

---

### 3.3 完整锁依赖图

```
MMC 硬件超时/卡死
        │
        ▼
┌─────────────────────────────────────────┐
│  kworker/u17:0 (brcmf_sdio_dataworker)  │
│  sdio_claim_host(host)  ← 持有 MMC 锁   │
│  mmc_wait_for_req_done  ← 永久等待硬件   │
└──────────────┬──────────────────────────┘
               │ MMC 锁被持有，永不释放
        ┌──────▼──────────────────────────────────┐
        │  NetworkManager                         │
        │  nl80211_get_station()                  │
        │  → sdio_claim_host()  ← 永久等待 MMC 锁  │
        │  wait-time: 4.9 小时                    │
        └─────────────────────────────────────────┘
               │ NetworkManager 持有某些网络资源
               │ (rtnl_lock 或其他锁)
        ┌──────▼────────────────────────┐
        │  addrconf_verify_work         │
        │  → rtnl_lock()  ← 永久等待     │
        └──────────┬────────────────────┘
                   │
        ┌──────────▼────────────────────┐
        │  ifconfig / ip link / bwrap   │
        │  → rtnl_lock()  ← 永久等待     │
        └───────────────────────────────┘
```

---

### 3.4 为什么 ifconfig 等命令无法使用

`ifconfig` 底层通过 `ioctl(SIOCGIFCONF)` 进入内核，必须获取 **`rtnl_lock`**。而此时：

1. **rtnl_lock 的直接持有者** 可能正在做某个需要等待 NetworkManager 完成的网络操作
2. 或者更直接：rtnl_lock 的持有者恰好也是一个需要访问 WiFi 芯片的操作，间接被 MMC 锁链阻塞

**关键死锁机制**：

```
MMC Host Lock (被 kworker 持有且永不释放)
        ↓
NetworkManager (等 MMC 锁)
        ↓ (NM 阻塞期间，rtnl 锁可能被 NM 或其调用的网络栈路径持有)
rtnl_lock (被持有)
        ↓
所有网络命令 (ifconfig, ip, netstat...) 全部阻塞
```

## 4 解决方式
以下两个解决方式单独可生效，也可两个一起使用。
### 4.1 系统下关闭省电
```bash
sudo tee /etc/NetworkManager/conf.d/default-wifi-powersave-off.conf > /dev/null << 'EOF'
[connection]
wifi.powersave = 2
EOF

sudo rm -f /etc/NetworkManager/conf.d/default-wifi-powersave-on.conf

sudo reboot
```
这是通过修改配置方式实现的，注意，该方式正确修改后，在未打开wifi未连接wifi时，使用iwconfig看到的powermanage可能还是on，只需要连接上wifi后，能变成off就可以。

### 4.2 驱动修改
```diff
diff --git a/kernel/drivers/net/wireless/broadcom/brcm80211/brcmfmac/sdio.c b/kernel/drivers/net/wireless/broadcom/brcm80211/brcmfmac/sdio.c
index 7fc2129c0..37a283aaa 100644
--- a/kernel/drivers/net/wireless/broadcom/brcm80211/brcmfmac/sdio.c
+++ b/kernel/drivers/net/wireless/broadcom/brcm80211/brcmfmac/sdio.c
@@ -4952,7 +4952,7 @@ struct brcmf_sdio *brcmf_sdio_probe(struct brcmf_sdio_dev *sdiodev)
 
 	/* ...and initialize clock/power states */
 	bus->clkstate = CLK_SDONLY;
-	bus->idletime = BRCMF_IDLE_INTERVAL;
+	bus->idletime = BRCMF_IDLE_ACTIVE;
 	bus->idleclock = BRCMF_IDLE_ACTIVE;
 
 	/* SR state */
```
- BRCMF_IDLE_INTERVAL（通常值为 1）：表示允许 SDIO 接口在短暂的无数据传输后进入低功耗状态（关闭或降低时钟频率以省电）。
- BRCMF_IDLE_ACTIVE（通常值为 0）：表示禁用空闲计时器，要求主机不要主动去改变 SDIO 的时钟状态，保持总线始终处于“唤醒/活跃”状态。
