---
title: "defconfig 编译选项依赖关系（Kconfig，select、depends on）"
date: 2026-01-21
last_modified_at: 2026-01-21
categories:
  - "Linux 通用编译指南"
tags:
  - "Linux 通用编译指南"
permalink: /linux-通用编译指南/defconfig-编译选项依赖关系-kconfig-select-depends-on/
toc: true
---

## 例子

- 如下，depends on 和 select 分别代表什么含义：

```Kconfig
config BRCMFMAC
	tristate "Broadcom FullMAC WLAN driver"
	depends on m
	depends on CFG80211
	select BRCMUTIL
	help
	  This module adds support for wireless adapters based on Broadcom
	  FullMAC chipsets. It has to work with at least one of the bus
	  interface support. If you choose to build a module, it'll be called
	  brcmfmac.ko.
```

见：https://docs.kernel.org/kbuild/kconfig-language.html#menu-attributes

## depends on（依赖于）

**含义**：定义当前配置项的依赖条件，只有满足这些条件时，当前选项才可见/可配置。

**在示例中的作用**：

```kconfig
depends on m
depends on CFG80211
```

tristate 表示`BRCMFMAC`是三态选项，y、m、n

1. **`depends on m`**：表示限制 `BRCMFMAC` 只能被编译为模块，而不能直接编译进内核，也就是由三态变为只有 m 和 n 两种状态。
   ![alt text](/assets/images/linux-通用编译指南/defconfig-编译选项依赖关系-kconfig-select-depends-on/PixPin_2026-01-21_14-00-59.png)

1. **`depends on CFG80211`**：表示依赖 `CFG80211` 配置项，但是不会强制开启`CFG80211`

## select（选中）

**含义**：定义反向依赖关系。当当前配置项被选中时，会自动选中指定的其他配置项。

**在示例中的作用**：

```kconfig
select BRCMUTIL
```

- 当用户选择启用 `BRCMFMAC` 时
- 系统会自动启用 `BRCMUTIL` 配置项
- 这表示 `BRCMFMAC` 需要 `BRCMUTIL` 的支持才能正常工作

## 关键区别

| 维度             | depends on | select       |
| ---------------- | ---------- | ------------ |
| 方向             | 我依赖别人 | 我拉起别人   |
| 是否自动开启     | ❌ 不会    | ✅ 会        |
| 是否检查对方依赖 | ✅ 会      | ❌ 不会      |
| 风险             | 几乎没有   | 可能破坏依赖 |
