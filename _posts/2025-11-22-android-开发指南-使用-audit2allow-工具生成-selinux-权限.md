---
title: "使用 audit2allow 工具生成 SELinux 权限"
date: 2025-11-22
last_modified_at: 2025-11-22
categories:
  - "Android 开发指南"
tags:
  - "Android 开发指南"
permalink: /android-开发指南/使用-audit2allow-工具生成-selinux-权限/
toc: true
---

概要：本文介绍了在 RK3568 Android11 SDK 上，如何通过 logcat 抓取 SELinux 拒绝日志，并使用 audit2allow 工具快速生成 SELinux 权限策略，解决权限拒绝问题。  


## 1. 环境准备  

在 SDK 根目录下，首先执行以下命令进行环境初始化：  

```bash
source build/envsetup.sh
lunch
```

---

## 2. 抓取 SELinux 拒绝日志  

在 Android 系统中，可以使用 logcat 命令抓取 SELinux 拒绝日志：  

```bash
logcat -Cb all | grep avc
```

### 2.1 示例日志  

以下是抓取到的部分 SELinux 拒绝日志示例：  

```
11-22 10:56:48.033  3101  3101 I ps      : type=1400 audit(0.0:3713): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hwservicemanager:s0 tclass=file permissive=1
11-22 10:56:58.146  3129  3129 I ps      : type=1400 audit(0.0:3744): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:lmkd:s0 tclass=file permissive=1
11-22 10:56:58.146  3129  3129 I ps      : type=1400 audit(0.0:3745): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_cas_default:s0 tclass=file permissive=1
11-22 10:56:58.146  3129  3129 I ps      : type=1400 audit(0.0:3746): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_drm_clearkey:s0 tclass=file permissive=1
11-22 10:56:58.146  3129  3129 I ps      : type=1400 audit(0.0:3747): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_drm_widevine:s0 tclass=file permissive=1
11-22 10:56:58.146  3129  3129 I ps      : type=1400 audit(0.0:3748): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_gatekeeper_default:s0 tclass=file permis
sive=1
11-22 10:57:08.263  3150  3150 I ps      : type=1400 audit(0.0:3786): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_sensors_default:s0 tclass=file permissiv
e=1
11-22 10:57:08.263  3150  3150 I ps      : type=1400 audit(0.0:3787): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:hal_power_default:s0 tclass=file permissive=
1
11-22 10:57:08.263  3150  3150 I ps      : type=1400 audit(0.0:3788): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:rk_output_hal:s0 tclass=file permissive=1
11-22 10:57:08.263  3150  3150 I ps      : type=1400 audit(0.0:3789): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:radio:s0 tclass=file permissive=1
11-22 10:57:08.273  3150  3150 I ps      : type=1400 audit(0.0:3790): avc: denied { open } for path="/proc/276/stat" dev="proc" ino=27301 scontext=u:r:preinstall:s0 tcontext=u:r:h
al_sensors_default:s0 tclass=file permissive=1
11-22 10:57:18.376  3171  3171 I ps      : type=1400 audit(0.0:3799): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:tee:s0 tclass=file permissive=1
11-22 10:57:18.376  3171  3171 I ps      : type=1400 audit(0.0:3800): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:statsd:s0 tclass=file permissive=1
11-22 10:57:18.376  3171  3171 I ps      : type=1400 audit(0.0:3801): avc: denied { read } for scontext=u:r:preinstall:s0 tcontext=u:r:secure_element:s0:c44,c260,c512,c768 tclass=
file permissive=1
11-22 10:57:18.383  3171  3171 I ps      : type=1400 audit(0.0:3802): avc: denied { open } for path="/proc/181/stat" dev="proc" ino=27257 scontext=u:r:preinstall:s0 tcontext=u:r:t
ee:s0 tclass=file permissive=1
11-22 10:49:30.613   155   155 E SELinux : avc:  denied  { find } for pid=2150 uid=0 name=activity scontext=u:r:bootshell:s0 tcontext=u:object_r:activity_service:s0 tclass=service
_manager permissive=1
```

---

## 3. 使用 audit2allow 生成权限策略  

### 3.1 保存日志文件  

将上述日志保存为 `avc_log.txt` 文件：  

```bash
# 保存命令示意
logcat -Cb all | grep avc > avc_log.txt
```

### 3.2 生成权限策略  

执行以下命令使用 audit2allow 工具生成权限策略：  

```bash
audit2allow -i avc_log.txt
```

### 3.3 输出结果  

以下为生成的权限策略内容：  

```
#============= bootshell ==============
allow bootshell activity_service:service find;

#============= preinstall ==============
allow preinstall hal_cas_default:file read;
allow preinstall hal_drm_clearkey:file read;
allow preinstall hal_drm_widevine:file read;
allow preinstall hal_gatekeeper_default:file read;
allow preinstall hal_power_default:file read;
allow preinstall hal_sensors_default:file read;
allow preinstall lmkd:file read;
allow preinstall radio:file read;
allow preinstall rk_output_hal:file read;
allow preinstall secure_element: read;
allow preinstall statsd:file read;
allow preinstall tee:file read;
```

---

## 4. 注意事项  

- 上述策略需根据实际需求进行筛选和确认，避免添加不必要的权限；
- 修改完成后，需重新编译并部署 SELinux 策略；
- `permissive=1` 表示当前运行在宽容模式，建议在最终版本中切换为强制模式进行验证。
