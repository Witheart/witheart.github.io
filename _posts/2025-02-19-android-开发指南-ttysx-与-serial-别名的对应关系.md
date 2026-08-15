---
title: "ttySx 与 serial 别名的对应关系"
date: 2025-02-19
last_modified_at: 2025-02-19
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/ttysx-与-serial-别名的对应关系/
toc: true
---

## **1. 设备树（Device Tree）中的 `serialX` 别名**
在 Linux 设备树（DTS/DTSI）文件中，通常会有 `aliases` 节点，其中定义了 `serialX` 别名。例如：
```dts
aliases {
    serial0 = &uart0;
    serial1 = &uart1;
    serial2 = &uart2;
    serial6 = &uart8;  // 对应 UART8
};
```
在这个示例中：
- `serial0` → 关联 `&uart0`
- `serial1` → 关联 `&uart1`
- `serial2` → 关联 `&uart2`
- `serial6` → 关联 `&uart8`

---

## **2. `ttySx` 设备名称的分配**
在 Linux 中，UART 设备通常会被注册为 `/dev/ttySx`，其中 `x` 是一个编号。例如：
```
/dev/ttyS0
/dev/ttyS1
/dev/ttyS2
...
```
这个 `ttySx` 设备名称的编号与 `serialX` 一般来说一一对应，可以通过下文的方式检查。

---

## **3. 如何查看 `ttySx` 与 `serialX` 的对应关系？**

### **3.1 检查设备树中的 `aliases`**
在运行系统上，可以直接读取设备树中的 `aliases`：
```sh
cat /proc/device-tree/aliases/serial6
```
如果 `serial6` 关联的是 `uart8`，那么输出可能类似：
```
/serial@fe6c0000
```
可以在设备树文件中查找这个地址
```dts
uart8: serial@fe6c0000 {
    ...
}
```
这表示 `serial6` 设备实际上对应 `uart8`，其物理地址为 `0xfe6c0000`，与设备树上一致。但是并没有ttySx与Serial的对应信息，下文查看这部分。

---

### **3.2 使用 `dmesg` 查找 UART 设备**

在 Linux 启动时，`dmesg` 会记录所有 UART 设备的注册信息：
```sh
dmesg | grep -i "ttyS"
```
示例输出：
```
[    1.869027] fdd50000.serial: ttyS0 at MMIO 0xfdd50000 (irq = 17, base_baud = 1500000) is a 16550A
[    1.869512] fe670000.serial: ttyS1 at MMIO 0xfe670000 (irq = 63, base_baud = 1500000) is a 16550A
[    1.869878] fe680000.serial: ttyS2 at MMIO 0xfe680000 (irq = 64, base_baud = 1500000) is a 16550A
[    1.870203] fe690000.serial: ttyS3 at MMIO 0xfe690000 (irq = 65, base_baud = 1500000) is a 16550A
[    1.870513] fe6b0000.serial: ttyS4 at MMIO 0xfe6b0000 (irq = 66, base_baud = 1500000) is a 16550A
[    1.870850] fe6c0000.serial: ttyS6 at MMIO 0xfe6c0000 (irq = 67, base_baud = 1500000) is a 16550A
[    1.871165] fe6d0000.serial: ttyS5 at MMIO 0xfe6d0000 (irq = 68, base_baud = 1500000) is a 16550A
[  174.257599] ttyS6 - failed to request DMA, use interrupt mode
```
从上面的信息可以看出：
- `ttyS6` 是 **物理地址 `0xfe6c0000` 处的 UART 设备**

如果 `serial6` 绑定的是 `uart8`，并且 `uart8` 的地址是 `0xfe6c0000`，那么 `serial6` 对应的 `ttySx` 就是 `ttyS6`。

### 4. 修改物理资源对应的ttyS名称
- 由上文可知
  - serial和ttyS是一一对应的关系
  - &uart对应物理串口资源
  - 修改设备树中的serial别名可以改变ttyS名称

1. **确定当前ttyS对应的物理资源**
   ```bash
   dmesg | grep -i "ttyS"
   ```
   示例输出：
   ```
   [    1.869027] fdd50000.serial: ttyS0 at MMIO 0xfdd50000 (irq = 17, base_baud = 1500000) is a 16550A
   ```
   - 物理资源地址：0xfdd50000
   - 当前ttyS名称：ttyS0

2. **在设备树中查找对应uart节点**
   - 搜索物理资源地址（如0xfdd50000）
   - 找到对应的uart节点

3. **修改serial别名**
   - 在设备树中修改该uart节点的serial别名
   - 确保serial编号不重复

4. **特殊注意事项**
   - 如果修改的是debugger串口的serial别名：
     - 需要同步修改fiq_debugger中的`rockchip,serial-id`字段
     - 例如：`rockchip,serial-id = <6>;`需要与新的serial编号一致
