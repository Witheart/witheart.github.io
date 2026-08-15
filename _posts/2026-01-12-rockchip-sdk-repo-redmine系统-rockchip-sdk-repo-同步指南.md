---
title: "Rockchip SDK repo 同步指南"
date: 2026-01-12
last_modified_at: 2026-01-12
categories:
  - "Rockchip SDK repo、Redmine系统"
tags:
  - "Rockchip SDK repo、Redmine系统"
permalink: /rockchip-sdk-repo-redmine系统/rockchip-sdk-repo-同步指南/
toc: true
---

> 以下内容参考《Rockchip_User_Guide_SDK_Application_And_Synchronization_CN.pdf》

## 公钥验证
- SDK申请需要提交一个文档，申请成功后，会发来一个网页让你提交公钥

- repo的同步是通过ssh
- 用户名和FTP用户名以及Redmine都是同一个，而实际身份验证是使用公钥验证的

- 需要配置下这个文件
```bash
$ sudo vim ~/.ssh/config

Host gerrit.rock-chips.com
HostName gerrit.rock-chips.com
User 实际用户名
Port 8222
IdentityFile ~/.ssh/id_rsa
PreferredAuthentications publickey
StrictHostKeyChecking no
UserKnownHostsFile ~/.ssh/known_hosts
PubKeyAcceptedKeyTypes +ssh-rsa
```

- 给予644权限
```bash
chmod 644 ~/.ssh/config
```

- 尝试ssh连接
```bash
ssh -vT 实际用户名@gerrit.rock-chips.com -p 8222
```

- 成功则会输出欢迎信息
```bash
****    Welcome to Gerrit Code Review    ****

  Hi 填写资料时的公司名, you have successfully connected over SSH.

  Unfortunately, interactive shells are disabled.
  To clone a hosted Git repository, use:

  git clone ssh://实际用户名@gerrit.rock-chips.com:8222/REPOSITORY_NAME.git
```

## 源码同步
- 一般采用下载repo基础包+ssh同步的方式获取最新的源码
- repo基础包：RK使用FTP服务器发布，为分卷压缩形式，解压后得到一个.repo目录
- 在.repo目录上层，检出源码
```bash
.repo/repo/repo sync -l
```

- 如果报错PermissionError: [Errno 1] Operation not permitted
```bash
# 修复.repo目录的权限
sudo chown -R $USER:$USER .repo

# 确保有读写权限
chmod -R u+rw .repo
```

- 同步更新
```bash
.repo/repo/repo sync -c
```

## 二次授权
此处同步更新会要求输入账号密码，实际上是因为还未进行二次授权

- 下载授权脚本
```bash
git clone https://gerrit.rock-chips.com:8443/repo-release/tools/script
```

- 进入工具目录
```bash
cd script/
```

- 执行授权脚本
```bash
./Generate-Credential.x
```

- 按要求输入账号(Gerrit账号)，公司邮箱，私钥名称，脚本会自动验证
```bash
$ ./Generate-Credential.x
Adding configuration for Gerrit server to /home/arm/rk_test_config
***********************************************************************************************************************************************************************************************************************************************
 Copyright Statement                                                                                                                                                  
                                                                                                                                                                      
 Copyright (C) 2024 Rockchip Electronics Co., Ltd. All rights reserved.                                                                                               
                                                                                                                                                                      
 BY OPENING OR USING THIS FILE, RECEIVER HEREBY ACKNOWLEDGES AND AGREES THAT THE SOFTWARE/FIRMWARE AND ITS DOCUMENTATIONS ("ROCKCHIP SOFTWARE") RECEIVED FROM ROCKCHIP ON AN "AS-IS" BASIS ONLY WITHOUT ANY AND ALL WARRANTIES,
 EITHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING, WITHOUT LIMITATION, ANY WARRANTY OR CONDITION WITH RESPECT TO TITLE, MERCHANTABILITY, FITNESS FOR ANY PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
 NEITHER DOES ROCKCHIP PROVIDE ANY WARRANTY WHATSOEVER WITH RESPECT TO ANY OPEN SOURCE TECHNOLOGIES, THIRD-PARTY TECHNOLOGIES OR ANY STANDARD TECHNOLOGIES WHICH MAY BE SUPPORTED BY, INCORPORATED IN, OR SUPPLIED WITH THE ROCKCHIP SOFTWARE.
 RECEIVER EXPRESSLY ACKNOWLEDGES THAT IT IS RECEIVER'S SOLE RESPONSIBILITY TO OBTAIN AND MAINTAIN ALL NECESSARY LICENSES AND RIGHTS FROM THEIR RESPECTIVE OWNERS TO USE ANY SUCH THIRD-PARTY TECHNOLOGIES OR ANY STANDARD TECHNOLOGIES.
 RECEIVER'S SOLE AND EXCLUSIVE REMEDY AND ROCKCHIP'S ENTIRE AND CUMULATIVE LIABILITY WITH RESPECT TO THE ROCKCHIP SOFTWARE RELEASED HEREUNDER WILL BE, AT ROCKCHIP 'S OPTION, TO REVISE OR REPLACE THE ROCKCHIP SOFTWARE AT ISSUE,
 OR REFUND ANY FEES OR CHARGE PAID BY RECEIVER TO ROCKCHIP FOR SUCH ROCKCHIP SOFTWARE AT ISSUE.                                                                       
***********************************************************************************************************************************************************************************************************************************************
Do you agree to the above terms? (yes/no) yes
Please input your username (make sure to use the username exactly the same as the one in RK email!!): Gerrit账号
Please input your email (make sure to use the company email address!!): 公司邮箱（申请SDK时使用的邮箱）
Please input your SSH private key filename (e.g. id_rsa): 私钥名称，此处我填写的是id_rsa
Your Credential check has passed
find: ‘/home/arm/.git-credentials’: No such file or directory
You don't have any git credential history!!
You are All Set!!
```

- 上述操作成功后，会在~/下生成一些配置，包括.gitconfig、.git-credentials
- 此时尝试重新同步，则无需输入账号密码了

- 同步可能会报类似这样的错误
```bash
Fetching:  0% (0/70) warming uperror: svn is different in /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/projects/app/rkipc.git vs /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/project-objects/linux/ipc/app/rkipc.git
error.GitError: Cannot fetch --force-sync not enabled; cannot overwrite a local work tree. If you're comfortable with the possibility of losing the work tree's git metadata, use `repo sync --force-sync app/rkipc` to proceed.
error: svn is different in /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/projects/external/samples.git vs /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/project-objects/linux/ipc/media/samples-ng.git
error.GitError: Cannot fetch --force-sync not enabled; cannot overwrite a local work tree. If you're comfortable with the possibility of losing the work tree's git metadata, use `repo sync --force-sync external/samples` to proceed.
Fetching: 100% (70/70), done in 33m38.690s
docs/cn/RK3588: Shared project linux/bsp/internal_doc found, disabling pruning.
docs/en/RK3588: Shared project linux/bsp/internal_doc found, disabling pruning.
yocto/meta-browser: Shared project linux/poky found, disabling pruning.
yocto/meta-clang: Shared project linux/poky found, disabling pruning.
yocto/meta-lts-mixins: Shared project linux/poky found, disabling pruning.
yocto/meta-openembedded: Shared project linux/poky found, disabling pruning.
yocto/poky: Shared project linux/poky found, disabling pruning.
docs: Shared project linux/bsp/docs found, disabling pruning.
docs/cn: Shared project linux/bsp/docs found, disabling pruning.
docs/en: Shared project linux/bsp/docs found, disabling pruning.
Garbage collecting: 100% (70/70), done in 0.082s
Fetching:  0% (0/2) warming uperror: svn is different in /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/projects/app/rkipc.git vs /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/project-objects/linux/ipc/app/rkipc.git
error.GitError: Cannot fetch --force-sync not enabled; cannot overwrite a local work tree. If you're comfortable with the possibility of losing the work tree's git metadata, use `repo sync --force-sync app/rkipc` to proceed.
error: svn is different in /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/projects/external/samples.git vs /mnt/nvme/RK3588_SDK-251108/RK3588_LINUX6.1_SDK_RELEASE/RK3588_Linux_6.1_sync_repo/.repo/project-objects/linux/ipc/media/samples-ng.git
error.GitError: Cannot fetch --force-sync not enabled; cannot overwrite a local work tree. If you're comfortable with the possibility of losing the work tree's git metadata, use `repo sync --force-sync external/samples` to proceed.
Fetching: 100% (2/2), done in 0.026s
Garbage collecting: 100% (2/2), done in 0.002s
external/rkscript: Deleting obsolete checkout.
external/rk_ethercat_release: Deleting obsolete checkout.
yocto/meta-browser/: discarding 850 commits
yocto/meta-clang/: discarding 1512 commits
error: Cannot checkout linux/ipc/app/rkipc: ManifestInvalidRevisionError: revision refs/tags/linux-6.1-stan-rkr7 in linux/ipc/app/rkipc not found
error: in `sync -c`: revision refs/tags/linux-6.1-stan-rkr7 in linux/ipc/app/rkipc not found
```

- 使用强制同步即可
```bash
.repo/repo/repo sync -c --force-sync
```
