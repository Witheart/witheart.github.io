---
title: "解压bz2分卷失败 unexpeced EOF in archive"
date: 2026-06-23
last_modified_at: 2026-06-23
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/解压bz2分卷失败-unexpeced-eof-in-archive/
toc: true
---

## 问题描述
```bash
bzip2: Compressed file ends unexpectedly;
        perhaps it is corrupted?  *Possible* reason follows.
bzip2: Inappropriate ioctl for device
        Input file = (stdin), output file = (stdout)

It is possible that the compressed file(s) have become corrupted.
You can use the -tvv option to test integrity of such files.

You can use the `bzip2recover' program to attempt to recover
data from undamaged sections of corrupted files.

tar: Unexpected EOF in archive
tar: Unexpected EOF in archive
tar: Error is not recoverable: exiting now

```

## 问题原因
因为解压软件在读完第一个分卷（aa）时找不到后续的数据，所以认为文件被“意外截断”了。

## 解决方式
先合并成一个完整的压缩包，然后再解压

- 合并命令
```bash
cat 3568-5.10-226.tar.bz2* > 3568-5.10-226.tar.bz2
```
