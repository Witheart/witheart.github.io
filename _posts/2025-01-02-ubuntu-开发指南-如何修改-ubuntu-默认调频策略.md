---
title: "如何修改 Ubuntu 默认调频策略"
date: 2025-01-02
last_modified_at: 2025-01-02
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/如何修改-ubuntu-默认调频策略/
toc: true
---

## **参考资料**

[https://blog.csdn.net/weixin_43245753/article/details/123141527](https://blog.csdn.net/weixin_43245753/article/details/123141527)
[https://www.kernel.org/doc/Documentation/cpu-freq/governors.txt](https://www.kernel.org/doc/Documentation/cpu-freq/governors.txt)

## **CPU 频率相关命令**

- **查看 CPU 的策略组**

  - 在`/sys/devices/system/cpu/cpufreq`路径下，有不同的 police 目录，每个 policyX 目录代表一个 CPU 调节策略组（policy group）
  - 这些策略组的编号（如 policy0、policy4）通常对应不同的 CPU 核心组，可能是按照物理核心、逻辑核心或能效核心（如大核/小核架构）划分。
  - RK3588 的 CPU 有 8 个核心，并且分为三个策略组（policy groups）
  - 查看策略组
    ```bash
    cat /sys/devices/system/cpu/cpufreq/policy*/related_cpus
    ```

    输出

    ```bash
    0 1 2 3
    4 5
    6 7
    ```

- **查看当前调频策略**：

  ```bash
  cat /sys/devices/system/cpu/cpufreq/policy*/scaling_governor
  ```

- **查看可用的调频策略**：

  ```bash
  cat /sys/devices/system/cpu/cpufreq/policy*/scaling_available_governors
  ```

- **调频策略说明**：

  - **Conservative**：逐步调整 CPU 频率，节能但反应较慢。
  - **Ondemand**：系统负载增加时立即提升频率，响应快但耗电。
  - **Userspace**：用户可以手动设置频率，灵活但需要管理。
  - **Powersave**：始终使用最低频率，省电但性能差。
  - **Performance**：始终使用最高频率，性能好但耗电。
  - **Schedutil**：智能调整频率，平衡性能与能效。

- **设置为性能策略**：
  ```bash
  echo performance > /sys/devices/system/cpu/cpufreq/policy*/scaling_governor
  ```

## **补充：设置 GPU、NPU 和 DMC 为 `performance` 模式**

除了 CPU，RK3588 还具有 GPU、NPU 和 DMC，可以通过以下方式分别设置为性能模式：

### (1) 设置 GPU 为 `performance`：

```bash
echo performance | sudo tee /sys/class/devfreq/fb000000.gpu/governor
```

### (2) 设置 NPU 为 `performance`：

```bash
echo performance | sudo tee /sys/class/devfreq/fdab0000.npu/governor
```

### (3) 设置 DMC 为 `performance`：

```bash
echo performance | sudo tee /sys/class/devfreq/dmc/governor
```

## **具体操作**

1. **找到开机自动执行的脚本**：

   - 通常在 `/etc/rc.local` 中找到自动执行的脚本（例如 `autorun.sh`），这个脚本由 `rc.local` 执行，包含用户自定义的开机自动执行命令（没有就自己创建一个，记得通过 chmod +x 给执行权限）。

2. **编辑 `autorun.sh`**：

   - 添加如下内容以设置频率调控器为性能模式：

     ```bash
      # 设置 CPU 为 performance 模式

      echo performance | tee /sys/devices/system/cpu/cpufreq/policy*/scaling_governor

      # 设置 GPU 为 performance 模式

      echo performance | tee /sys/class/devfreq/fb000000.gpu/governor

      # 设置 NPU 为 performance 模式

      echo performance | tee /sys/class/devfreq/fdab0000.npu/governor

      # 设置 DMC 为 performance 模式

      echo performance | tee /sys/class/devfreq/dmc/governor

      echo "All devices set to performance mode."
     ```
