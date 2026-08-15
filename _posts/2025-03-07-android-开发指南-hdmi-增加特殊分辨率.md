---
title: "HDMI 增加特殊分辨率"
date: 2025-03-07
last_modified_at: 2025-03-07
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/hdmi-增加特殊分辨率/
toc: true
---

<br/>
- 一般的 HDMI 分辨率都有适配，但是在某些横屏转竖屏 HDMI 输出下，就需要增加特殊的 HDMI 分辨率了
- 本文用于指导如何添加特殊分辨率的 HDMI 显示。
## 参考文档
- `RK官方文档\02、Android\common\display\Rockchip_Developer_Guide_HDMI_CN.pdf`
- `RK官方文档\02、Android\common\display\Rockchip_Developer_Guide_HDMI_Based_on_DRM_Framework_CN&EN.pdf`


## 1. 修改 HDMI 驱动文件

### 文件路径

`kernel/drivers/gpu/drm/bridge/synopsys/dw-hdmi.c`

### 修改内容

#### 1.1 修改 `dw_hdmi_default_modes` 结构体

在 `dw_hdmi_default_modes` 结构体中，可以通过注释掉不需要的分辨率并添加新的分辨率配置。例如：

```c
static const struct drm_display_mode dw_hdmi_default_modes[] = {
    /**/
    { DRM_MODE("800x1280", DRM_MODE_TYPE_DRIVER, 75860, 800, 848,
               880, 960, 0, 1280, 1283, 1293, 1317, 0,
               DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_NVSYNC), 
      .vrefresh = 60, .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
#if 0
    /* 4 - 1280x720@60Hz 16:9 */
    { DRM_MODE("1280x720", DRM_MODE_TYPE_DRIVER, 74250, 1280, 1390,
               1430, 1650, 0, 720, 725, 730, 750, 0,
               DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
      .vrefresh = 60, .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
    
    /* 16 - 1920x1080@60Hz 16:9 */
    { DRM_MODE("1920x1080", DRM_MODE_TYPE_DRIVER, 148500, 1920, 2008,
               2052, 2200, 0, 1080, 1084, 1089, 1125, 0,
               DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_PVSYNC),
      .vrefresh = 60, .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
    /* 更多注释内容省略 */
#endif
};
```

- **新增分辨率示例**：上例中添加了一个 `800x1280@60Hz` 的分辨率。
- **注释无用分辨率**：通过 `#if 0` 和 `#endif` 注释掉不需要的分辨率配置。

#### 1.2 注释 EDID 获取代码

找到以下代码并注释掉：

```c
edid = drm_get_edid(connector, hdmi->ddc);
```
改为
```c
edid = NULL;
```
不管有没有读到 edid 都强制按 def_modes 来显示。

---

## 2. 修改 EDID 文件

### 文件路径

`kernel/drivers/gpu/drm/drm_edid.c`

### 修改内容

在 `edid_cea_modes_0` 结构体中，添加所需的分辨率。例如：

```c
{ DRM_MODE("800x1280", DRM_MODE_TYPE_DRIVER, 75860, 800, 848,
           880, 960, 0, 1280, 1283, 1293, 1317, 0,
           DRM_MODE_FLAG_PHSYNC | DRM_MODE_FLAG_NVSYNC),
  .vrefresh = 60, .picture_aspect_ratio = HDMI_PICTURE_ASPECT_16_9, },
```

---

## 3. 分辨率参数说明

分辨率参数的具体含义如下：
| 像素时钟 | 行有效时钟 | 行同步起始像素 | 行同步结束像素 | 一行总像素 | hskew | 帧有效行 | 帧同步开始行 | 帧同步结束行 | 一帧总行数 | vscan |
|----------|------------|----------------|----------------|------------|-------|----------|--------------|--------------|------------|-------|
| 75860    | 800        | 848            | 880            | 960        | 0     | 1280     | 1283         | 1293         | 1317       | 0     |

![alt text](/assets/images/android-开发指南/hdmi-增加特殊分辨率/image.png)
---

## 4. 像素时钟计算公式

像素时钟计算公式如下：

```text
Pixel Clock (kHz) = Total Pixels per Frame × Refresh Rate (Hz) / 1000
```

例如，对于 `800x1280@60Hz`：

- 一行总像素数：960  
- 一帧总行数：1317  
- 刷新率：60Hz  

计算：

```text
960 × 1317 × 60 / 1000 = 75859.2
```

取整后为 **75860 kHz**。

---

## 5. 解决显示比例异常问题

当 HDMI 输出分辨率设置完成后，可能会出现显示比例不正常的现象。这是由于 **UI 绘制分辨率（Framebuffer 分辨率）** 与 **HDMI 输出分辨率** 不一致导致的。Framebuffer 分辨率与 HDMI 输出分辨率不同时，系统会进行缩放。

### 解决方法

在 Android 的 `device.mk` 文件中，设置 Framebuffer 分辨率以匹配 HDMI 输出分辨率。

#### 修改文件路径

`device.mk`

#### 修改内容

在 `PRODUCT_PROPERTY_OVERRIDES` 下增加以下属性：

```makefile
persist.vendor.framebuffer.main=800x1280
```

---

## 6. 注意事项

1. **分辨率参数准确性**：确保新增分辨率的参数计算正确，避免显示异常。
2. **EDID 配置与驱动一致性**：新增分辨率时，确保 `dw_hdmi_default_modes` 和 `edid_cea_modes_0` 中的配置一致。
3. **Android 系统属性配置**：如果使用 Android 系统，确保 Framebuffer 分辨率通过系统属性与 HDMI 输出分辨率一致。

---

通过以上步骤，即可成功为 HDMI 增加特殊分辨率，并解决潜在的显示比例问题。
