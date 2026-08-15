---
title: "Android 音频输入设备优先级"
date: 2025-12-25
last_modified_at: 2025-12-25
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/android-音频输入设备优先级/
toc: true
---

## 源码
frameworks/av/services/audiopolicy/enginedefault/src/Engine.cpp

```cpp
sp<DeviceDescriptor> Engine::getDeviceForInputSource(audio_source_t inputSource) const
{
    const DeviceVector availableOutputDevices = getApmObserver()->getAvailableOutputDevices();
    const DeviceVector availableInputDevices = getApmObserver()->getAvailableInputDevices();
    const SwAudioOutputCollection &outputs = getApmObserver()->getOutputs();
    DeviceVector availableDevices = availableInputDevices;
    sp<AudioOutputDescriptor> primaryOutput = outputs.getPrimaryOutput();
    DeviceVector availablePrimaryDevices = primaryOutput == nullptr ? DeviceVector()
            : availableInputDevices.getDevicesFromHwModule(primaryOutput->getModuleHandle());
    sp<DeviceDescriptor> device;

    // when a call is active, force device selection to match source VOICE_COMMUNICATION
    // for most other input sources to avoid rerouting call TX audio
    if (isInCall()) {
        switch (inputSource) {
        case AUDIO_SOURCE_DEFAULT:
        case AUDIO_SOURCE_MIC:
        case AUDIO_SOURCE_VOICE_RECOGNITION:
        case AUDIO_SOURCE_UNPROCESSED:
        case AUDIO_SOURCE_HOTWORD:
        case AUDIO_SOURCE_CAMCORDER:
        case AUDIO_SOURCE_VOICE_PERFORMANCE:
            inputSource = AUDIO_SOURCE_VOICE_COMMUNICATION;
            break;
        default:
            break;
        }
    }

    switch (inputSource) {
    case AUDIO_SOURCE_DEFAULT:
    case AUDIO_SOURCE_MIC:
        device = availableDevices.getDevice(
                AUDIO_DEVICE_IN_BLUETOOTH_A2DP, String8(""), AUDIO_FORMAT_DEFAULT);
        if (device != nullptr) break;
        if (getForceUse(AUDIO_POLICY_FORCE_FOR_RECORD) == AUDIO_POLICY_FORCE_BT_SCO) {
            device = availableDevices.getDevice(
                    AUDIO_DEVICE_IN_BLUETOOTH_SCO_HEADSET, String8(""), AUDIO_FORMAT_DEFAULT);
            if (device != nullptr) break;
        }
        device = availableDevices.getFirstExistingDevice({
                AUDIO_DEVICE_IN_WIRED_HEADSET, AUDIO_DEVICE_IN_USB_HEADSET,
                AUDIO_DEVICE_IN_USB_DEVICE, AUDIO_DEVICE_IN_BUILTIN_MIC});
        break;

```

### 输入设备优先级选择机制：

- 通话状态强制规则
- 通话中，多数输入源强制使用`AUDIO_SOURCE_VOICE_COMMUNICATION`
- 确保通话TX音频路径稳定

### 默认/麦克风源设备选择顺序
**按优先级从高到低：**

1. **蓝牙A2DP输入设备**（高质量音频传输）

2. **蓝牙SCO耳机**（仅在录制强制策略设为`AUDIO_POLICY_FORCE_BT_SCO`时选择）

3. **按顺序选择第一个可用的有线/USB设备**：
   - 有线耳机麦克风
   - USB耳机麦克风
   - USB音频设备
   - 内置麦克风（最终备选）

## 设计原则
1. 外接设备优先于内置设备
2. 通话场景优先保证通信质量
3. 确保总有可用设备
