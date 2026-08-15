---
title: "Bash 快速使用"
date: 2025-11-28
last_modified_at: 2025-11-28
categories:
  - "Linux 基础知识"
tags:
  - "Linux 基础知识"
permalink: /linux-基础知识/bash-快速使用/
toc: true
---

**定位与目标**
- 重点覆盖：脚本结构、变量与引号、条件判断与流程、函数与返回值、数组与遍历、I/O 重定向、错误处理、权限与设备操作、Here-Doc、日志规范等。


**脚本概览**

- 常见脚本结构：
  - `shebang` 指定解释器：`#!/usr/bin/env bash`
  - 日志工具函数：统一输出格式，便于排查
  - 环境准备：定位脚本目录、root 权限检查
  - 具体任务：文件替换、权限设置、固件部署、烧写、记录变更、同步
  - 结果汇总：按步骤聚合状态并设置退出码
- 示例脚本中的关键点：
  - 使用函数组织日志输出（`LOG_INFO`、`LOG_ERR`等）
  - 使用命令替换 `$(...)` 与变量收集系统信息
  - 使用条件与退出码 `$?` 判定每步成功与否
  - 使用 Here-Doc 追加多行文本到文件
  - 对敏感操作（`dd`、`sync`）进行显式提示和确认

**基础语法**

- 脚本头与执行
  - `#!/usr/bin/env bash` 指定使用系统中 `bash` 解释器
  - 赋予执行权限并运行：`chmod +x qy_wifi_solve.sh && sudo bash qy_wifi_solve.sh`
- 命令替换
  - `$(...)` 将命令输出作为字符串：`TS() { date '+%F %T'; }`
  - 示例：`LOG_INFO "当前用户: $(id -un), 主机: $(hostname), 内核: $(uname -r)"`

**变量与引号**

- 赋值与读取
  - 赋值不写空格：`VAR=value`；读取用 `$VAR` 或 `"${VAR}"`
- 引号策略（极其重要）
  - 双引号：展开变量但保护空格与通配（推荐日常使用）
    - `echo "路径是: ${SCRIPT_DIR}"`
  - 单引号：原样输出，不展开变量
    - Here-Doc 中 `<<'EOF'` 防止变量展开
  - 不加引号：可能发生词拆分与通配，易出错
- 脚本示例中的规范用法
  - `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"` 逐层双引号，避免路径中空格导致错误
  - 测试文件存在：`[ -f "${SRC_RC_LOCAL}" ]` 始终加引号

**条件判断与比较**

- `test`/`[` 基础：
  - 文件存在：`-f` 普通文件、`-d` 目录、`-e` 任意存在
  - 整数比较：`-eq`、`-ne`、`-gt`、`-lt`
  - 字符串是否为空：`-z`、`-n`
- 高级 `[[ ... ]]`（推荐）：
  - 更安全，支持模式匹配、避免词拆分
  - 例：`if [[ -f "$file" && -w "$file" ]]; then ... fi`
- 退出码与 `$?`
  - 成功为 0，失败非 0；立刻读取上一条命令的结果：`if [ $? -eq 0 ]; then ... fi`
- 脚本中的组合判断
  - 多步骤结果汇总：串联 `&&` 检查所有 `RESULT_*` 为“成功”后设置最终结果

**流程控制**

- `if/elif/else`
  - 例：root 检查
    - `if [ "${EUID:-$(id -u)}" -ne 0 ]; then ... fi`
- `for` 循环
  - 遍历数组：`for f in "${FW_FILES[@]}"; do ... done`
- `case`（在需要多分支时）
  - 结构清晰，易读：适合处理命令行参数或状态码

**函数与返回值**

- 定义函数
  - `name() { ... }` 或 `function name { ... }`
- 返回值与退出码
  - `return` 设置函数退出码；整个脚本的退出码用 `exit` 控制
  - 例：日志函数仅输出；业务函数通过命令的 `$?` 判断是否成功
- 作用域
  - Bash 默认无块级作用域，函数内变量对全局可见；需用局部变量 `local var=value`

**数组与遍历**

- 定义数组
  - `arr=("a" "b" "c")`
- 读取元素
  - 单个：`${arr[0]}`；全部：`"${arr[@]}"`（保留元素边界）
- 脚本中的数组示例
  - `FW_FILES=("cyfmac43455-sdio.bin" "cyfmac43455-sdio.clm_blob" "cyfmac43455-sdio.txt")`

**I/O 重定向与管道**

- 标准输出与错误输出
  - 追加：`>>`；覆盖：`>`
  - 重定向错误到空：`2>/dev/null`
- 管道
  - 连接多个命令：`ls -al | grep txt`
- 日志到内核缓冲
  - 你的 `autorun.sh` 中 `echo "...初始化WiFi结束" > /dev/kmsg` 写入内核日志，可用 `dmesg` 查看

**Here-Doc（多行文本追加）**

- 用法
  - `cat >> "/etc/buildinfo" <<'EOF'` 将 `EOF` 到结束符之间的文本写入文件
- 单引号结束符
  - `<<'EOF'` 阻止变量与命令展开，保证原样写入
- 本脚本将多行改动说明原样追加到 `/etc/buildinfo`

**权限与用户**

- `chmod` 改权限，`chown` 改属主
  - `chmod 755 /etc/rc.local`；`chown root:root /etc/rc.local`
- 检查用户是否存在
  - `id -u user >/dev/null 2>&1`
- root 权限判断
  - `if [ "${EUID:-$(id -u)}" -ne 0 ]; then ... fi`

**错误处理与健壮性**

- 退出策略
  - 全局严格模式（进阶）：`set -euo pipefail`
    - `-e` 出错退出；`-u` 未定义变量报错；`pipefail` 管道任何一步失败则失败
  - 注意：启用后需对可预期失败的命令加以处理（如 `|| true`）
- `trap` 捕获退出做清理（进阶）
  - `trap 'cleanup' EXIT` 保证异常情况下也能收尾
- `$?` 读取上一命令状态
  - 本脚本大量使用 `$?` 进行逐步判断与日志输出

**文件操作与路径**

- 安全复制与替换
  - `cp -f src dest` 强制覆盖
  - 先检查源文件存在，再复制，再设置权限与属主
- 创建目录
  - `mkdir -p /lib/firmware/cypress`
- 规范获取脚本目录
  - `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"` 兼容相对路径调用

**设备写入与同步**

- `dd` 烧写设备
  - `dd conv=fsync,notrunc if=./boot.img of=/dev/disk/by-partlabel/boot`
  - `fsync` 保证写入落盘；`notrunc` 不截断输出文件
- 两次 `sync`
  - 主动触发页缓存刷新，降低断电数据丢失风险

**字符串处理与测试技巧**

- 拼接与格式化
  - 用双引号包裹字符串并内插变量：`LOG_INFO "复制到: ${TARGET_RC_LOCAL}"`
- 测试组合条件
  - `if [ -f "$f" ] && [ -s "$f" ]; then ... fi`
- 数值比较与算数
  - `$((i+1))`；或用 `(( i++ ))`
