---
title: "使用Intel的SMBus控制器与IIC器件通信"
date: 2024-12-23
last_modified_at: 2024-12-23
categories:
  - "模块使用"
tags:
  - "模块使用"
permalink: /模块使用/使用intel的smbus控制器与iic器件通信/
toc: true
---

本文介绍如何通过 Intel 的 SMBus 控制器与 IIC 器件（例如 LM75 温度传感器）进行通信，包括寄存器地址说明、读写操作过程及相关代码实现。


## **1. 寄存器地址**

1. **SMBus 控制器 IO 空间的基地址：** `0xEFA0`
2. **偏移地址：**
   - 所有寄存器地址均为相对于基地址的偏移。例如，`0x03` 实际地址为 `0xEFA0 + 0x03`。
   - 偏移地址说明：
     - `0x00`：复位寄存器。
     - `0x02`：控制寄存器，用于发起读写操作。
     - `0x03`：设备内部寄存器地址。
     - `0x04`：器件地址（已左移 1 位）。
     - `0x05`、`0x06`：数据寄存器，存储读回或写入的数据。

3. **器件地址：**
   - IIC 器件地址为 7 位地址（如 LM75 的地址为 `0x48`）。
   - 在 SMBus 通信中，器件地址需左移 1 位：
     - 写操作：直接使用左移后的地址。
     - 读操作：在左移后的地址上加 1。

---

## **2. 读操作流程**

通过 SMBus 控制器读取 IIC 器件数据的步骤如下：

1. **复位 SMBus 控制器：**  
   往 `0x00` 寄存器写入 `0xFF`。
2. **写入器件地址：**  
   将器件地址加 1（表示读操作），写入寄存器 `0x04`。
3. **指定器件内部寄存器地址：**  
   将目标寄存器地址写入寄存器 `0x03`。
4. **发起读操作：**  
   往 `0x02` 寄存器写入控制命令 `0x4C`，启动读操作。
5. **延时 1ms：**  
   等待 SMBus 操作完成。
6. **读取数据：**  
   从寄存器 `0x05` 和 `0x06` 读取从器件返回的数据。

---

## **3. 写操作流程**

通过 SMBus 控制器向 IIC 器件写入数据的步骤如下：

1. **复位 SMBus 控制器：**  
   往 `0x00` 寄存器写入 `0xFF`。
2. **写入器件地址：**  
   将器件地址（左移 1 位，表示写操作）写入寄存器 `0x04`。
3. **指定器件内部寄存器地址：**  
   将目标寄存器地址写入寄存器 `0x03`。
4. **发起写操作：**  
   往 `0x02` 寄存器写入控制命令 `0x4C`，启动写操作。
5. **延时 1ms：**  
   等待 SMBus 操作完成。
6. **写入数据：**  
   将数据写入寄存器 `0x05` 和 `0x06`。

---
## **4. 调试方式**
前期，可通过RW工具（RW - Read & Write Utility v1.7）直接写寄存器进行SMBus调试，确保有响应后，再编写代码。
![alt text](/assets/images/模块使用/使用intel的smbus控制器与iic器件通信/image.png)

Access -> IO Space

手动修改这几个寄存器即可：
![alt text](/assets/images/模块使用/使用intel的smbus控制器与iic器件通信/image-1.png)

---

## **5. 代码说明**

以下代码实现了通过 SMBus 控制器与 LM75 温度传感器通信的基本读写功能。

---

### **5.1 SMBus 读操作**

```cpp
BYTE SMBusReadByte(WORD ControlAddress, BYTE deviceAddress, BYTE command) {
    WriteIoPortByteType WriteIO = (WriteIoPortByteType)GetProcAddress(hModule, "WriteIoPortByte");
    ReadIoPortByteType ReadIO = (ReadIoPortByteType)GetProcAddress(hModule, "ReadIoPortByte");

    BYTE value;

    // 复位 SMBus 控制器
    WriteIO(ControlAddress, 0xFF);

    // 写入器件地址（读操作，+1）
    WriteIO(ControlAddress + 0x04, deviceAddress + 0x01);

    // 写入器件内部寄存器地址
    WriteIO(ControlAddress + 0x03, command);

    // 发起读操作
    WriteIO(ControlAddress + 0x02, 0x48);

    // 等待 1ms
    Sleep(1);

    // 读取数据
    value = ReadIO(ControlAddress + 0x05);

    return value;
}
```

---

### **5.2 SMBus 写操作**

```cpp
BYTE SMBusWriteByte(WORD ControlAddress, BYTE deviceAddress, BYTE command, BYTE data) {
    WriteIoPortByteType WriteIO = (WriteIoPortByteType)GetProcAddress(hModule, "WriteIoPortByte");

    // 复位 SMBus 控制器
    WriteIO(ControlAddress, 0xFF);

    // 写入器件地址（写操作）
    WriteIO(ControlAddress + 0x04, deviceAddress);

    // 写入器件内部寄存器地址
    WriteIO(ControlAddress + 0x03, command);

    // 发起写操作
    WriteIO(ControlAddress + 0x02, 0x48);

    // 等待 1ms
    Sleep(1);

    // 写入数据
    WriteIO(ControlAddress + 0x05, data);

    return 0;
}
```

---

### **5.3 与 LM75 的通信示例**

以下是与 LM75 温度传感器通信的完整代码示例：
- 关于LM75的具体使用，请参考文章《LM75 温度传感器使用》

```cpp
int main() {
    // 初始化 SMBus 控制器
    if (LInitializeOls() != 0) {
        std::cerr << "Failed to initialize SMBus controller!" << std::endl;
        return -1;
    }

    // 初始化 LM75（配置寄存器）
    SMBusWriteByte(0xEFA0, 0x90, 0x01, 0x00); // 将 LM75 配置成正常工作模式
    Sleep(1000);

    // 循环读取温度数据
    while (true) {
        // 读取 LM75 温度寄存器的 16 位原始数据
        WORD tempRaw = SMBusReadWord(0xEFA0, 0x90, 0x00);

        // 修正字节顺序
        tempRaw = ((tempRaw & 0xFF) << 8) | ((tempRaw >> 8) & 0xFF);

        // 将原始数据转换为实际温度
        double temp = (tempRaw >> 7) * 0.5;

        // 打印温度数据
        std::cout << "Temperature: " << temp << "°C" << std::endl;

        Sleep(1000);
    }

    // 关闭 SMBus 控制器
    LDeinitializeOls();

    return 0;
}
```
