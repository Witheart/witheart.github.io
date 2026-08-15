---
title: "RK 3588 Hailo AI 加速卡 性能测试指南"
date: 2025-02-27
last_modified_at: 2025-02-27
categories:
  - "hailo 加速卡驱动安装及使用"
tags:
  - "hailo 加速卡驱动安装及使用"
permalink: /hailo-加速卡驱动安装及使用/rk-3588-hailo-ai-加速卡-性能测试指南/
toc: true
---

概要：本文介绍了在 RK 3588 平台上使用 Hailo AI 加速卡进行性能测试的方法，包括模型下载、性能测试命令及可能遇到的错误和解决方案。  


## 1. 模型下载与准备  

在驱动和 RT 库安装完成后，可以使用 Hailo 官方提供的模型进行推理测试。  

### 1.1 模型下载地址  
[Hailo Model Zoo](https://github.com/hailo-ai/hailo_model_zoo/)  

以 **Vehicle Detection（车辆检测）** 模型为例，可以从以下网址下载 `yolov5m_vehicles.hef` 文件，并将其放到插入加速卡的目标板上：  
[Vehicle Detection 模型下载](https://github.com/hailo-ai/hailo_model_zoo/tree/master/hailo_models/vehicle_detection)  

---

## 2. 性能测试  

### 2.1 运行性能测试命令  
使用以下命令测试 `yolov5m_vehicles.hef` 模型的性能：  

```sh
hailortcli benchmark yolov5m_vehicles.hef
```

### 2.2 示例输出  

```sh
root@user:~/hailo_model# hailortcli benchmark yolov5m_vehicles.hef
Starting Measurements...
Measuring FPS in HW-only mode
Network auto_group_0/yolov5m_vehicles: 100% | 1206 | FPS: 80.36 | ETA: 00:00:00
Measuring FPS (and Power on supported platforms) in streaming mode
[HailoRT] [warning] Using the overcurrent protection dvm for power measurement will disable the overcurrent protection.
If only taking one measurement, the protection will resume automatically.
If doing continuous measurement, to enable overcurrent protection again you have to stop the power measurement on this dvm.
Network auto_group_0/yolov5m_vehicles: 100% | 605 | FPS: 40.23 | ETA: 00:00:00
Measuring HW Latency
Network auto_group_0/yolov5m_vehicles: 100% | 204 | HW Latency: 28.33 ms | ETA: 00:00:00

=======
Summary
=======
FPS     (hw_only)                 = 80.3613
        (streaming)               = 40.2285
Latency (hw)                      = 28.3283 ms
Device 0000:01:00.0:
  Power in streaming mode (average) = 2.11651 W
                          (max)     = 2.15756 W
```

### 2.3 结果解析  

- **FPS（hw_only）= 80.36**：硬件模式下的帧率，表示模型在纯硬件模式下的推理速度。  
- **FPS（streaming）= 40.23**：流式模式下的帧率，表示模型在数据流模式下的推理速度。  
- **Latency（hw）= 28.33 ms**：硬件推理的延迟时间，单位为毫秒（ms）。  
- **功耗**：
  - **平均功耗 = 2.11651 W**  
  - **最大功耗 = 2.15756 W**  

---

## 3. 可能遇到的错误及解决方案  

### 3.1 驱动和 RT 库版本不匹配  

如果运行测试时出现以下错误：  

```sh
root@user:~/hailo_models# hailortcli benchmark yolov5m_vehicles.hef
Starting Measurements...
Measuring FPS in HW-only mode
[HailoRT] [error] CHECK failed - Driver version (4.20.1) is different from library version (4.20.0)
[HailoRT] [error] Driver version mismatch, status HAILO_INVALID_DRIVER_VERSION(76)
[HailoRT] [error] CHECK_SUCCESS failed with status=HAILO_INVALID_DRIVER_VERSION(76)
[HailoRT CLI] [error] CHECK_SUCCESS failed with status=HAILO_INVALID_DRIVER_VERSION(76) - Failed creating vdevice
[HailoRT CLI] [error] CHECK_SUCCESS failed with status=HAILO_INVALID_DRIVER_VERSION(76) - Measuring FPS in HW-only mode failed
```

**解决方案**：  
该错误表明 **驱动版本与 Hailo RT 库版本不匹配**，需要重新安装匹配的版本。请确保安装的驱动版本与 Hailo RT 库的版本相同，并重新进行测试。  
