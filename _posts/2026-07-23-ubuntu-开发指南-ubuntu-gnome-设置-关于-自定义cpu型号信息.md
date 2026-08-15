---
title: "Ubuntu Gnome 设置-关于 自定义CPU型号信息"
date: 2026-07-23
last_modified_at: 2026-07-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-gnome-设置-关于-自定义cpu型号信息/
toc: true
---

## 问题描述
RK3588 使用Ubuntu Gnome系统，在设置->关于的CPU型号一栏中，无法显示CPU型号，该栏为空。

## 分析
GNOME 设置面板在查 CPU 型号的时候，不会去调什么外部探测程序，而是老老实实地去读系统内核的/proc/cpuinfo 文件，使用其中的model name字段。
```bash
user@user:~$ cat /proc/cpuinfo
processor       : 0
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x2
CPU part        : 0xd05
CPU revision    : 0

processor       : 1
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x2
CPU part        : 0xd05
CPU revision    : 0

processor       : 2
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x2
CPU part        : 0xd05
CPU revision    : 0

processor       : 3
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x2
CPU part        : 0xd05
CPU revision    : 0

processor       : 4
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x4
CPU part        : 0xd0b
CPU revision    : 0

processor       : 5
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x4
CPU part        : 0xd0b
CPU revision    : 0

processor       : 6
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x4
CPU part        : 0xd0b
CPU revision    : 0

processor       : 7
BogoMIPS        : 48.00
Features        : fp asimd evtstrm aes pmull sha1 sha2 crc32 atomics fphp asimdhp cpuid asimdrdm lrcpc dcpop asimddp
CPU implementer : 0x41
CPU architecture: 8
CPU variant     : 0x4
CPU part        : 0xd0b
CPU revision    : 0

Serial          : 6d0b3663055c6058
```
可以看到，在RK3588上，没有这个字段，所以Gnome就读不到型号信息。

## 解决方式1
GNOME 在读 `/proc/cpuinfo` 的时候，是严格按块（Block）来读的。它只认包含 `processor : 0`、`processor : 1` 这样开头的数据块。我们直接用文本流处理工具 `sed`，强行给它的每一个核心都塞进一行 `model name`。

```bash
# 如果之前挂载过自己的型号信息，先卸载
sudo umount /proc/cpuinfo

# 复制原有的信息
sudo cp /proc/cpuinfo /etc/fake_cpuinfo

# 用 sed 命令，在每一行 "processor" 的下方，强行插入一行定制的 model name
sudo sed -i '/^processor/a model name\t: Rockchip RK3588 (Custom Edition)' /etc/fake_cpuinfo

# 重新挂载覆盖上去
sudo mount --bind /etc/fake_cpuinfo /proc/cpuinfo

```

## 解决方式2
按理说，/proc/cpuinfo 根本就不是硬盘上的真实文件。它是 Linux 内核在系统运行时，由虚拟文件系统在内存中动态生成的。每次你敲 cat 去看它的时候，内核底层的代码（在 ARM64 架构下主要是 arch/arm64/kernel/cpuinfo.c）就会去实时读取 CPU 里面的硬件寄存器（比如 MIDR_EL1，获取厂商、架构、版本等原始十六进制数据），然后按固定的代码逻辑打印到屏幕上。所以应该能通过修改源码，强制显示CPU型号。

arch/arm64/kernel/cpuinfo.c
```diff
diff --git a/kernel/arch/arm64/kernel/cpuinfo.c b/kernel/arch/arm64/kernel/cpuinfo.c
index e2b1bceeb..95754eb26 100644
--- a/kernel/arch/arm64/kernel/cpuinfo.c
+++ b/kernel/arch/arm64/kernel/cpuinfo.c
@@ -158,6 +158,8 @@ static int c_show(struct seq_file *m, void *v)
 		 * "processor".  Give glibc what it expects.
 		 */
 		seq_printf(m, "processor\t: %d\n", i);
+		/* 强制给所有 64 位和 32 位程序输出自定义型号 */
+        seq_printf(m, "model name\t: Rockchip RK3588\n");
 		if (compat)
 			seq_printf(m, "model name\t: ARMv8 Processor rev %d (%s)\n",
 				   MIDR_REVISION(midr), COMPAT_ELF_PLATFORM);
```

实测，如上修改后，Gnome的设置->关于会在CPU型号显示`Rockchip RK3588 x8`。

还可以这么修改
```diff
diff --git a/kernel/arch/arm64/kernel/cpuinfo.c b/kernel/arch/arm64/kernel/cpuinfo.c
index e2b1bceeb..cc75e877b 100644
--- a/kernel/arch/arm64/kernel/cpuinfo.c
+++ b/kernel/arch/arm64/kernel/cpuinfo.c
@@ -158,6 +158,14 @@ static int c_show(struct seq_file *m, void *v)
 		 * "processor".  Give glibc what it expects.
 		 */
 		seq_printf(m, "processor\t: %d\n", i);
+		/* 动态判断大小核并输出 */
+        if (MIDR_PARTNUM(midr) == 0xd05) {
+            seq_printf(m, "model name\t: Rockchip RK3588 (Cortex-A55)\n");
+        } else if (MIDR_PARTNUM(midr) == 0xd0b) {
+            seq_printf(m, "model name\t: Rockchip RK3588 (Cortex-A76)\n");
+        } else {
+            seq_printf(m, "model name\t: Rockchip RK3588\n");
+        }
 		if (compat)
 			seq_printf(m, "model name\t: ARMv8 Processor rev %d (%s)\n",
 				   MIDR_REVISION(midr), COMPAT_ELF_PLATFORM);

```
会显示Rockchip RK3588 (Cortex-A55) x4 Rockchip RK3588 (Cortex-A76) x4
