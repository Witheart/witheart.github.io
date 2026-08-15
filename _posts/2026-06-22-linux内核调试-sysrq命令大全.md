---
title: "sysrq命令大全"
date: 2026-06-22
last_modified_at: 2026-06-22
categories:
  - "Linux内核调试"
tags:
  - "Linux内核调试"
permalink: /linux内核调试/sysrq命令大全/
toc: true
---

## sysrq 命令大全
https://www.kernel.org/doc/html/v4.11/admin-guide/sysrq.html#what-are-the-command-keys

| Command (命令) | Function (功能) |
| :--- | :--- |
| b | Will immediately reboot the system without syncing or unmounting your disks.<br>系统将立即重启，而不会同步或卸载磁盘。 |
| c | Will perform a system crash by a NULL pointer dereference. A crashdump will be taken if configured.<br>将通过空指针解引用导致系统崩溃。如果已配置，则会生成崩溃转储文件。 |
| d | Shows all locks that are held.<br>显示所有已锁定的锁。 |
| e | Send a SIGTERM to all processes, except for init.<br>向除 init 进程外的所有进程发送 SIGTERM 信号。 |
| f | Will call the oom killer to kill a memory hog process, but do not panic if nothing can be killed.<br>将会调用 OOM 杀手程序来终止占用大量内存的进程，但如果无法终止任何进程，也不要惊慌。 |
| g | Used by kgdb (kernel debugger)<br>由 kgdb（内核调试器）使用。 |
| h | Will display help (actually any other key than those listed here will display help. but h is easy to remember :-)<br>将显示帮助（实际上，除了这里列出的按键之外，任何其他按键都会显示帮助。不过 h 比较容易记住 :-)）。 |
| i | Send a SIGKILL to all processes, except for init.<br>向除 init 进程外的所有进程发送 SIGKILL 信号。 |
| j | Forcibly “Just thaw it” - filesystems frozen by the FIFREEZE ioctl.<br>强制“解冻” - FIFREEZE ioctl 冻结的文件系统。 |
| k | Secure Access Key (SAK) Kills all programs on the current virtual console. NOTE: See important comments below in SAK section.<br>安全访问密钥 (SAK) 会终止当前虚拟控制台上的所有程序。注意：请参阅下文 SAK 部分的重要说明。 |
| l | Shows a stack backtrace for all active CPUs.<br>显示所有活动 CPU 的堆栈回溯信息。 |
| m | Will dump current memory info to your console.<br>会将当前内存信息输出到您的主机。 |
| n | Used to make RT tasks nice-able<br>用于使 RT 任务更易于执行。 |
| o | Will shut your system off (if configured and supported).<br>将关闭您的系统（如果已配置且支持）。 |
| p | Will dump the current registers and flags to your console.<br>会将当前寄存器和标志位输出到控制台。 |
| q | Will dump per CPU lists of all armed hrtimers (but NOT regular timer_list timers) and detailed information about all clockevent devices.<br>将按 CPU 输出所有已启动的 hrtimer 列表（但不包括常规 timer_list 定时器）以及所有 clockevent 设备的详细信息。 |
| r | Turns off keyboard raw mode and sets it to XLATE.<br>关闭键盘原始模式并将其设置为 XLATE 模式。 |
| s | Will attempt to sync all mounted filesystems.<br>将尝试同步所有已挂载的文件系统。 |
| t | Will dump a list of current tasks and their information to your console.<br>将当前任务及其信息列表输出到控制台。 |
| u | Will attempt to remount all mounted filesystems read-only.<br>将尝试以只读方式重新挂载所有已挂载的文件系统。 |
| v | Forcefully restores framebuffer console<br>强制恢复帧缓冲区控制台。<br><br>Causes ETM buffer dump [ARM-specific]<br>导致 ETM 缓冲区转储 [ARM 特有]。 |
| w | Dumps tasks that are in uninterruptable (blocked) state.<br>转储处于不可中断（阻塞）状态的任务。 |
| x | Used by xmon interface on ppc/powerpc platforms. Show global PMU Registers on sparc64. Dump all TLB entries on MIPS.<br>用于 PPC/PowerPC 平台上的 xmon 接口。在 SPARC64 平台上显示全局 PMU 寄存器。在 MIPS 平台上转储所有 TLB 条目。 |
| y | Show global CPU Registers [SPARC-64 specific]<br>显示全局 CPU 寄存器 [SPARC-64 特有]。 |
| z | Dump the ftrace buffer<br>转储 ftrace 缓冲区。 |
| 0-9 | Sets the console log level, controlling which kernel messages will be printed to your console. (0, for example would make it so that only emergency messages like PANICs or OOPSes would make it to your console.)<br>设置控制台日志级别，控制哪些内核消息会打印到控制台。（例如，设置为 0 则只会将 PANIC 或 OOPS 等紧急消息打印到控制台。） |
