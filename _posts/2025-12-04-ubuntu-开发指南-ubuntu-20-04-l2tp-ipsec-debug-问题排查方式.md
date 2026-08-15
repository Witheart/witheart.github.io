---
title: "Ubuntu 20.04 L2TP IPsec debug 问题排查方式"
date: 2025-12-04
last_modified_at: 2025-12-04
categories:
  - "Ubuntu 开发指南"
tags:
  - "Ubuntu 开发指南"
permalink: /ubuntu-开发指南/ubuntu-20-04-l2tp-ipsec-debug-问题排查方式/
toc: true
---

思路：
在确保网络通畅的情况下，需定位在 IPsec 阶段还是 L2TP/PPP 阶段出错。

## 1 网络连通性检查

1. 首先确保双方的网络正常，用 ping 工具检查，客户端和主机要互相能访问。比如，客户端起码需要能 ping 通主机的公网 ip，或者局域网 ip（如果是在同一个局域网内建立）。
2. 确保端口开放性。服务器 vpn 的各个服务是跑在不同的端口上的，确保端口是畅通的，没有被防火墙拦截。
   查看防火墙规则

```bash
$ sudo iptables -L

Chain INPUT (policy DROP)
ACCEPT     udp  --  anywhere             anywhere             udp dpt:isakmp
ACCEPT     udp  --  anywhere             anywhere             udp dpt:ipsec-nat-t
ACCEPT     udp  --  anywhere             anywhere             udp dpt:l2f
ACCEPT     esp  --  anywhere             anywhere

Chain ufw-user-input (1 references)
ACCEPT     udp  --  anywhere             anywhere             udp dpt:isakmp
ACCEPT     udp  --  anywhere             anywhere             udp dpt:ipsec-nat-t
ACCEPT     udp  --  anywhere             anywhere             udp dpt:l2f
ACCEPT     udp  --  192.168.100.0/24     anywhere
```

```bash
$ sudo ufw status
Status: active

To                         Action      From
--                         ------      ----
OpenSSH                    ALLOW       Anywhere
22/tcp                     ALLOW       Anywhere
Samba                      ALLOW       Anywhere
445/tcp                    ALLOW       Anywhere
500/udp                    ALLOW       Anywhere
4500/udp                   ALLOW       Anywhere
1701/udp                   ALLOW       Anywhere
Anywhere                   ALLOW       192.168.100.0/24/udp
OpenSSH (v6)               ALLOW       Anywhere (v6)
22/tcp (v6)                ALLOW       Anywhere (v6)
Samba (v6)                 ALLOW       Anywhere (v6)
445/tcp (v6)               ALLOW       Anywhere (v6)
500/udp (v6)               ALLOW       Anywhere (v6)
4500/udp (v6)              ALLOW       Anywhere (v6)
1701/udp (v6)              ALLOW       Anywhere (v6)

```

```bash
# 从外部测试端口是否开放
nc -vzu 你的服务器IP 500
nc -vzu 你的服务器IP 4500
nc -vzu 你的服务器IP 1701
```

3. 检查端口是否有服务监听

```bash
sudo ss -ulnp | grep -E ':(500|4500|1701)\b'
```

## 2 问题阶段定位

1. 查看服务是否运行
   下面的日志说明 strongswan 成功启动过：

```bash
$ sudo systemctl status strongswan-starter.service

● strongswan-starter.service - strongSwan IPsec IKEv1/IKEv2 daemon using ipsec.conf
     Loaded: loaded (/lib/systemd/system/strongswan-starter.service; enabled; vendor preset: enabled)
     Active: inactive (dead) since Wed 2025-12-03 18:48:54 CST; 15h ago
    Process: 3866937 ExecStart=/usr/sbin/ipsec start --nofork (code=exited, status=0/SUCCESS)
   Main PID: 3866937 (code=exited, status=0/SUCCESS)

12月 03 18:48:54 hw-Default-string systemd[1]: Started strongSwan IPsec IKEv1/IKEv2 daemon using ipsec.conf.
12月 03 18:48:54 hw-Default-string ipsec[3866937]: Starting strongSwan 5.8.2 IPsec [starter]...
12月 03 18:48:54 hw-Default-string ipsec[3866937]: charon is already running (/var/run/charon.pid exists) -- skipping daemon start
12月 03 18:48:54 hw-Default-string ipsec_starter[3866937]: Starting strongSwan 5.8.2 IPsec [starter]...
12月 03 18:48:54 hw-Default-string ipsec_starter[3866937]: charon is already running (/var/run/charon.pid exists) -- skipping daemon start
12月 03 18:48:54 hw-Default-string ipsec_starter[3866937]: starter is already running (/var/run/starter.charon.pid exists) -- no fork done
12月 03 18:48:54 hw-Default-string ipsec[3866937]: starter is already running (/var/run/starter.charon.pid exists) -- no fork done
12月 03 18:48:54 hw-Default-string systemd[1]: strongswan-starter.service: Succeeded.

```

下面的日志说明 l2tp 正在运行

```bash
$ sudo systemctl status xl2tpd.service
● xl2tpd.service - LSB: layer 2 tunelling protocol daemon
     Loaded: loaded (/etc/init.d/xl2tpd; generated)
     Active: active (running) since Wed 2025-12-03 18:48:54 CST; 15h ago
       Docs: man:systemd-sysv-generator(8)
    Process: 3866944 ExecStart=/etc/init.d/xl2tpd start (code=exited, status=0/SUCCESS)
      Tasks: 2 (limit: 76942)
     Memory: 1.8M
     CGroup: /system.slice/xl2tpd.service
             ├─3866949 /usr/sbin/xl2tpd
             └─3877326 /usr/sbin/pppd /dev/pts/17 passive nodetach 192.168.100.1:192.168.100.100 refuse-pap auth require-chap name AndroidVPN file /etc/ppp/options.xl2tpd

12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Maximum retries exceeded for tunnel 51128.  Closing.
12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Terminating pppd: sending TERM signal to pid 3877274
12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Connection 39195 closed to 192.168.0.149, port 49068 (Timeout)
12月 04 09:59:01 hw-Default-string pppd[3877274]: Terminating on signal 15
12月 04 09:59:01 hw-Default-string pppd[3877274]: Modem hangup
12月 04 09:59:01 hw-Default-string pppd[3877274]: Connect time 3.5 minutes.
12月 04 09:59:01 hw-Default-string pppd[3877274]: Sent 0 bytes, received 720 bytes.
12月 04 09:59:01 hw-Default-string pppd[3877274]: Connection terminated.
12月 04 09:59:02 hw-Default-string pppd[3877274]: Exit.
12月 04 09:59:32 hw-Default-string xl2tpd[3866949]: Unable to deliver closing message for tunnel 51128. Destroying anyway.

```

2. 开启用于抓包的终端，然后使用客户端连接，查看包的走向

```bash
sudo tcpdump -n -i any '(udp port 500 or udp port 4500 or udp port 1701)'
```

3. 查看连接时 ipsec 侧的日志

```bash
sudo tail -f /var/log/syslog | grep -iE 'charon|IKE|AUTH'
```

charon：StrongSwan IPsec 服务的守护进程名
IKE：Internet Key Exchange（密钥交换协议）
AUTH：认证相关的消息

4. 查看连接时 l2tp 侧的日志

```bash
$ sudo journalctl -u xl2tpd.service -f

-- Logs begin at Sat 2024-10-12 15:52:10 CST. --
12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Maximum retries exceeded for tunnel 51128.  Closing.
12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Terminating pppd: sending TERM signal to pid 3877274
12月 04 09:59:01 hw-Default-string xl2tpd[3866949]: Connection 39195 closed to 192.168.0.149, port 49068 (Timeout)
12月 04 09:59:01 hw-Default-string pppd[3877274]: Terminating on signal 15
12月 04 09:59:01 hw-Default-string pppd[3877274]: Modem hangup
12月 04 09:59:01 hw-Default-string pppd[3877274]: Connect time 3.5 minutes.
12月 04 09:59:01 hw-Default-string pppd[3877274]: Sent 0 bytes, received 720 bytes.
12月 04 09:59:01 hw-Default-string pppd[3877274]: Connection terminated.
12月 04 09:59:02 hw-Default-string pppd[3877274]: Exit.
12月 04 09:59:32 hw-Default-string xl2tpd[3866949]: Unable to deliver closing message for tunnel 51128. Destroying anyway.
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: Connection established to 192.168.0.149, 41783.  Local: 20558, Remote: 22999 (ref=0/0).  LNS session is 'default'
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: start_pppd: I'm running:
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "/usr/sbin/pppd"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "/dev/pts/18"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "passive"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "nodetach"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "192.168.100.1:192.168.100.101"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "refuse-pap"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "auth"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "require-chap"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "name"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "AndroidVPN"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "file"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: "/etc/ppp/options.xl2tpd"
12月 04 10:05:42 hw-Default-string xl2tpd[3866949]: Call established with 192.168.0.149, PID: 3877451, Local: 21899, Remote: 28873, Serial: -1952760018
12月 04 10:05:42 hw-Default-string pppd[3877451]: pppd 2.4.7 started by root, uid 0
12月 04 10:05:42 hw-Default-string pppd[3877451]: Using interface ppp1
12月 04 10:05:42 hw-Default-string pppd[3877451]: Connect: ppp1 <--> /dev/pts/18
12月 04 10:05:45 hw-Default-string pppd[3877451]: Deflate (15) compression enabled
12月 04 10:05:45 hw-Default-string pppd[3877451]: Cannot determine ethernet address for proxy ARP
12月 04 10:05:45 hw-Default-string pppd[3877451]: local  IP address 192.168.100.1
12月 04 10:05:45 hw-Default-string pppd[3877451]: remote IP address 192.168.100.101
```

## 3 日志分析手段

**分析方法总览**

- 先看链路抓包确认握手阶段是否成功，再看 IPsec 守护进程日志验证协商细节，最后用 L2TP/PPP 日志判断呼入与认证阶段是否完成。
- 组合三个日志的信息，定位是“控制面（IKE）”还是“数据面（ESP/L2TP/PPP）”出现阻断。

**如何用日志快速判定阶段**

- 看 `ipsec.log` 是否有 “IKE_SA established” 和 “CHILD_SA established with TS … udp/l2f”：
  - 有 → 控制面与策略匹配没问题，继续看数据面/防火墙
  - 无 → 关注 `NO_PROPOSAL_CHOSEN`、`AUTH failed` 等，回到算法或密钥问题
- 看 `l2tp.log` 是否出现 “Connection established / start_pppd / Using interface ppp0 / local/remote IP”：
  - 有 → L2TP/PPP OK；若后续上不了网，再看转发/NAT/DNS
  - 无/大量 Timeout → 抓包确认是否有 `ESP` 或 `UDP 4500` 数据面；多半是被拦或未强制封装
- 看 `tcpdump`：
  - 握手：`UDP 500`
  - 数据面：在无 NAT 时应抓 `ip proto 50`；在 NAT-T 时看 `UDP 4500`
  - 若只看到握手，不见数据面 → 防火墙或路由丢包

**关于数据面和控制面**
- 数据面：实际承载业务数据的路径与报文，例如用户的 IP 包、L2TP/PPP 载荷等。
- 控制面：用于建立、维护、拆除连接的信令与协商报文，例如 IKE 握手、路由/会话管理信息。

- 控制面：
  - IKEv1 握手使用 `UDP 500`（若有 NAT 则还用 `UDP 4500`），用于协商密钥、算法、建立 SA。
  - 日志表现为 `phase 1 ident`、`oakley-quick`、`IKE_SA/CHILD_SA established` 等。
- 数据面：
  - 业务数据（L2TP/PPP）被 `ESP` 加密后传输，协议号为 `50`（非端口）。
  - 同网段、无 NAT 时，数据面走 `ESP (proto 50)`；启用 NAT-T 时，数据面改封装在 `UDP 4500`。
  - 在 L2TP/IPsec 中，`UDP 1701` 的 L2TP流量被保护在 ESP 内，所以链路上看不到明文 `1701/udp`。
