---
title: "Android编译错误：Soong阶段因缺失res目录导致panic (Iwlan模块)"
date: 2025-09-01
last_modified_at: 2025-09-01
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/android编译错误-soong阶段因缺失res目录导致panic-iwlan模块/
toc: true
---

## 报错日志
```bash
rk3588 WILL NOT COMPILE rkaiq_tool_server binary
error: packages/services/Iwlan/Android.bp:13:1: module "Iwlan" variant "android_common": module source path "packages/services/Iwlan/res" does not exist
internal error: panic in GenerateBuildActions for module "Iwlan" variant "android_common"
rule_builder paths cannot be nil
goroutine 6860636 [running]:
github.com/google/blueprint.newPanicErrorf({0xd412a0, 0x10615e8}, {0xc37c553f80, 0x40}, {0x0, 0x0, 0x0})
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:4252 +0x79
github.com/google/blueprint.(*Context).generateModuleBuildActions.func2.1.1()
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:2933 +0x2fe
panic({0xd412a0, 0x10615e8})
        prebuilts/go/linux-x86/src/runtime/panic.go:838 +0x207
android/soong/android.checkPathNotNil(...)
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/android/rule_builder.go:767
android/soong/android.(*RuleBuilderCommand).addInput(...)
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/android/rule_builder.go:772
android/soong/android.(*RuleBuilderCommand).Input(0xc37c7a0b40?, {0x0?, 0x0?})
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/android/rule_builder.go:1064 +0xfa
android/soong/java.(*AndroidApp).generateJavaUsedByApex(0xc170367980, {0x109e2c8?, 0xc37911cc80})
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/java/app_builder.go:268 +0x410
android/soong/java.(*AndroidApp).GenerateAndroidBuildActions(0x109e2c8?, {0x109e2c8, 0xc37911cc80})
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/java/app.go:281 +0x50
android/soong/android.(*ModuleBase).GenerateBuildActions(0xc1703679b0, {0x1077928?, 0xc379107ad0})
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/soong/android/module.go:2278 +0x1594
github.com/google/blueprint.(*Context).generateModuleBuildActions.func2.1(0xc006139cf0?, 0xec02ad?)
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:2937 +0x7f
github.com/google/blueprint.(*Context).generateModuleBuildActions.func2(0xc03e201dc0, 0x0?)
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:2938 +0x36a
github.com/google/blueprint.parallelVisit.func1.1()
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:2002 +0x3c
created by github.com/google/blueprint.parallelVisit.func1
        /mnt/hdd/rk3588_android13_sdk/rk_android13/build/blueprint/context.go:2001 +0x178


17:54:34 soong bootstrap failed with: exit status 1

#### failed to build some targets (40 seconds) ####

Build android failed!

```

## 问题分析
从编译日志来看，编译过程在 **Soong** 阶段（解析 `Android.bp` 文件并生成 `build.ninja` 文件）失败了。

错误信息非常明确：

```bash
error: packages/services/Iwlan/Android.bp:13:1: module "Iwlan" variant "android_common": module source path "packages/services/Iwlan/res" does not exist
```

1.  **问题文件**： `packages/services/Iwlan/Android.bp`
2.  **问题行数**： 第 13 行
3.  **具体错误**： 该模块（`Iwlan`）的源代码路径中包含了一个 `res` 资源目录，但这个目录在您的代码仓库中**并不存在**。

Soong 构建系统在尝试为这个模块创建构建规则时，因为找不到必需的输入文件（`res` 目录）而引发了内部panic，导致整个编译过程中止。

查看发现`packages/services/Iwlan/`下确实没有res目录，对比3588其他Android SDK的res目录，该目录下只有一个空的.gitignore

## 解决方式
`packages/services/Iwlan/`下添加res目录，并在其中添加空的.gitignore，问题解决。
