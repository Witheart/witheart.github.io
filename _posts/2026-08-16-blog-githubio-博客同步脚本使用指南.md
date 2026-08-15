---
title: "githubio 博客同步脚本使用指南"
date: 2026-08-16
last_modified_at: 2026-08-16
categories:
  - "blog"
tags:
  - "blog"
permalink: /blog/githubio-博客同步脚本使用指南/
toc: true
mathjax: true
---

概要：本文记录如何用 `githubio_sync.js` 脚本把本地笔记仓库 F:\notes 里的 markdown 笔记自动同步发布到个人博客 witheart.top（GitHub Pages + Jekyll minimal-mistakes），涵盖日常同步命令、增量上传原理、上传目录规则和注意事项，方便以后快速查阅。


## 一、这套东西是什么

F:\notes 是本地笔记库，witheart.top 是个人博客（GitHub 仓库 `Witheart/witheart.github.io`）。`githubio_sync.js` 负责把笔记（md）自动转换成 Jekyll 文章、拷贝图片，并 push 到 GitHub，由 GitHub Pages 自动编译发布。

三个关键位置：

| 位置 | 作用 |
|---|---|
| F:\notes\githubio_sync.js | 同步脚本（Node.js，本机已装 Node v24） |
| F:\notes\.githubio_upload_status.json | 上传状态清单（记录每篇的上传情况） |
| F:\Witheart.github.io | 站点仓库的本地 clone（脚本往里写文件并 push） |

依赖：Node.js、git（都已装好）。

---

## 二、日常命令速查（在 F:\notes 下执行）

| 命令 | 作用 |
|---|---|
| `node githubio_sync.js` | 完整同步：转换 + 自动 git commit + push（**最常用**） |
| `node githubio_sync.js --dry-run` | 只预览将新增/更新/删除哪些，不写文件不提交 |
| `node githubio_sync.js --status` | 只看上传状态统计 |
| `node githubio_sync.js --prune` | 额外删除「本地已删笔记」对应的线上文章 |
| `node githubio_sync.js --no-push` | 转换 + 提交，但不推送 |

以后每次新增/修改笔记后，`cd F:\notes` 再执行 `node githubio_sync.js` 即可，脚本会自动识别哪些是新增、哪些是更新，只处理有变化的。

---

## 三、增量同步原理（怎么知道哪些传了、哪些没传）

脚本靠清单文件 `.githubio_upload_status.json` 判断，清单大致结构：

```json
{
  "源文件相对路径": {
    "hash": "内容哈希",
    "post": "生成的文章文件名",
    "permalink": "文章链接",
    "date": "日期",
    "images": ["图片路径..."]
  }
}
```

其中 `hash` 是「md 内容 + 引用的本地图片字节」综合算出的 SHA-256。每次运行脚本都会重新算一遍当前 hash，和清单里存的比对：

- 清单里没有 → **新增**，上传
- hash 变了 → **更新**，重新生成并上传
- hash 没变 → **跳过**（没动过）
- 源文件没了 → **删除**（默认不动线上，加 `--prune` 才删对应文章）

所以：**「哪些上传了」看清单里有没有记录；「要不要重新传」看 hash 变没变。** 清单已随笔记仓库一起 commit，换机器 pull 下来状态也能延续。

---

## 四、上传哪些目录（范围规则）

规则写在 `githubio_sync.js` 顶部的 `isIncludedDir()`：

- **上传**：顶层目录名以数字开头、且编号 < 90（即 00~89），以后新增的编号目录会**自动包含**，不用改脚本。
- **不上传**：编号 ≥ 90（95/96/97/98/99/100 绝密等），以及无数字前缀的目录（如 `ARM软件培训`）。

要改范围就改 `isIncludedDir` 里的判断（比如把 `< 90` 改成 `< 100`），那行有注释。

---

## 五、md 到 Jekyll 文章的转换规则

- 分类（categories）= 顶层目录名**去掉编号前缀**，如 `05.2 Ubuntu 开发指南` → `Ubuntu 开发指南`。
- 标题、作者、更新时间自动从笔记头部提取，生成 front matter（title / date / last_modified_at / categories / tags / permalink / toc）。
- 日期取「更新时间」，没有该字段则用文件修改时间；未来日期自动改成今天（避免 Jekyll 不渲染）。
- 本地图片拷贝到 `assets/images/` 并重写路径。
- 笔记之间的 `.md` 互链改写为目标文章的永久链接。
- 含 `\(` 数学公式的自动加 `mathjax: true`。
- 每篇自动加 `toc: true`（右侧目录）。

---

## 六、注意事项

1. 运行时可能打印警告，两类常见（都是笔记本身的问题，脚本不改动原文）：
   - `missing image`：笔记引用了本地不存在的图片。
   - `unresolved internal link`：内部链接指向的 md 不在上传范围内或不存在。
2. 图片总体积已约 237MB，GitHub Pages 仓库限额 1GB，长期注意别超。
3. push 之后 GitHub Pages 要 **1~3 分钟**编译，网站才更新，别以为没生效。
4. 免费版约 **10 次构建/小时**，别短时间狂推几十次。
5. 仓库里 7 篇 minimal-mistakes 演示文章（2010/2019 年）保留了，别管它们。
6. `note_upload_tracker.sh` 和 `.upload_status` 是 **CSDN 上传**用的，与本脚本无关，互不影响。

---

## 七、原理简述（push 是怎么变成网页的）

`git push` → GitHub Pages 检测到 master 分支更新 → 起一个 Linux 容器，用内置 Jekyll 编译（`remote_theme` 会自动拉 minimal-mistakes 主题）→ 生成静态 HTML → 托管到 CDN → 通过 CNAME 以 witheart.top 访问。

本地不需要装 Ruby/Jekyll，编译全交给 GitHub，所以本地同步很快（脚本只做文本转换和拷贝图片，秒级）。
