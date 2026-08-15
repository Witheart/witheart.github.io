---
title: "OpenBMC_尝试使用Redfish API查询底层硬件信息"
date: 2026-07-14
last_modified_at: 2026-07-14
categories:
  - "BMC"
tags:
  - "BMC"
permalink: /bmc/openbmc-尝试使用redfish-api查询底层硬件信息/
toc: true
---

## 使用 curl 探测节点状态

Redfish 是基于 HTTPS 的 RESTful API。OpenBMC 内部有一个名为 `bmcweb` 的 C++ 守护进程在 443 端口监听请求。

在宿主机的新终端里，直接敲入这条命令，向 BMC 询问当前主机的状态：

```bash
curl -k -u root:0penBmc -X GET https://127.0.0.1:2443/redfish/v1/Systems/system

```

*(参数解释：`-k` 是忽略自签证书警告，`-u` 是账号密码，`-X GET` 是请求方法。)*

你会看到返回了一大坨 JSON 数据。仔细找找里面的 `"PowerState"` 字段，它现在的值应该是 `"Off"`。

```json
{
  "@odata.id": "/redfish/v1/Systems/system",
  "@odata.type": "#ComputerSystem.v1_22_0.ComputerSystem",
  "Actions": {
    "#ComputerSystem.Reset": {
      "@Redfish.ActionInfo": "/redfish/v1/Systems/system/ResetActionInfo",
      "target": "/redfish/v1/Systems/system/Actions/ComputerSystem.Reset"
    }
  },
  "Bios": {
    "@odata.id": "/redfish/v1/Systems/system/Bios"
  },
  "Boot": {
    "AutomaticRetryAttempts": 3,
    "AutomaticRetryConfig": "RetryAttempts",
    "AutomaticRetryConfig@Redfish.AllowableValues": [
      "Disabled",
      "RetryAttempts"
    ],
    "BootSourceOverrideEnabled": "Disabled",
    "BootSourceOverrideMode": "UEFI",
    "BootSourceOverrideMode@Redfish.AllowableValues": [
      "Legacy",
      "UEFI"
    ],
    "BootSourceOverrideTarget": "None",
    "BootSourceOverrideTarget@Redfish.AllowableValues": [
      "None",
      "Pxe",
      "Hdd",
      "Cd",
      "Diags",
      "BiosSetup",
      "Usb"
    ],
    "RemainingAutomaticRetryAttempts": 3,
    "StopBootOnFault": "Never",
    "TrustedModuleRequiredToBoot": "Disabled"
  },
  "BootProgress": {
    "LastState": "None",
    "LastStateTime": "1970-01-01T00:00:00.000000+00:00"
  },
  "Description": "Computer System",
  "FabricAdapters": {
    "@odata.id": "/redfish/v1/Systems/system/FabricAdapters"
  },
  "GraphicalConsole": {
    "ConnectTypesSupported": [
      "KVMIP"
    ],
    "MaxConcurrentSessions": 4,
    "ServiceEnabled": true
  },
  "Id": "system",
  "LastResetTime": "1970-01-01T00:00:00+00:00",
  "Links": {
    "Chassis": [
      {
        "@odata.id": "/redfish/v1/Chassis/chassis"
      }
    ],
    "ManagedBy": [
      {
        "@odata.id": "/redfish/v1/Managers/bmc"
      }
    ]
  },
  "LocationIndicatorActive": false,
  "LogServices": {
    "@odata.id": "/redfish/v1/Systems/system/LogServices"
  },
  "Memory": {
    "@odata.id": "/redfish/v1/Systems/system/Memory"
  },
  "MemorySummary": {
    "TotalSystemMemoryGiB": 0.0
  },
  "Name": "system",
  "PCIeDevices": [],
  "PCIeDevices@odata.count": 0,
  "PowerRestorePolicy": "AlwaysOff",
  "PowerState": "Off",
  "ProcessorSummary": {
    "Count": 0
  },
  "Processors": {
    "@odata.id": "/redfish/v1/Systems/system/Processors"
  },
  "SerialConsole": {
    "IPMI": {
      "ServiceEnabled": true
    },
    "MaxConcurrentSessions": 15,
    "SSH": {
      "HotKeySequenceDisplay": "Press ~. to exit console",
      "Port": 2200,
      "ServiceEnabled": true
    }
  },
  "Status": {
    "Health": "OK",
    "State": "Disabled"
  },
  "Storage": {
    "@odata.id": "/redfish/v1/Systems/system/Storage"
  },
  "SystemType": "Physical"
}
```

## 用 Python 编写你的第一个“节点监控”脚本

我们写一个 Python 脚本来优雅地提取这台服务器的温度和电源状态。

在宿主机上，新建一个文件叫 `bmc_monitor.py`，粘贴以下代码：

```python
import requests
import json
import urllib3

# 忽略自签发 HTTPS 证书的警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BMC_IP = "127.0.0.1"
PORT = "2443"
AUTH = ('root', '0penBmc')

def get_system_status():
    url = f"https://{BMC_IP}:{PORT}/redfish/v1/Systems/system"
    try:
        response = requests.get(url, auth=AUTH, verify=False, timeout=5)
        response.raise_for_status()
        data = response.json()
        
        print(f"[{data.get('Id')}] 节点状态:")
        print(f"电源状态: {data.get('PowerState')}")
        print(f"系统健康: {data.get('Status', {}).get('Health')}")
        
    except Exception as e:
        print(f"连接 BMC 失败: {e}")

if __name__ == "__main__":
    get_system_status()

```

运行它：`python3 bmc_monitor.py`。

---

## 💡 透视底层：刚才发生了什么？

当你从外部运行这个 Python 脚本时，BMC 内部发生了一条非常清晰的调用链，这就是 OpenBMC 的核心软件架构：

1. **外部请求：** 你的 Python 脚本向 `2443` 端口发送 HTTPS GET 请求。
2. **Web 服务器 (`bmcweb`)：** 接收到请求，验证 root 密码。它知道 `/redfish/v1/Systems/system` 对应的是主机的电源和状态信息。
3. **D-Bus 转换：** `bmcweb` 不会自己去读硬件！它会在内部发起一个 D-Bus 查询，实际上等同于在系统里执行了：
`busctl get-property xyz.openbmc_project.State.Host /xyz/openbmc_project/state/host0 xyz.openbmc_project.State.Host CurrentHostState`
4. **状态返回：** D-Bus 返回状态后，`bmcweb` 将其打包成 JSON 格式，通过 HTTP 响应扔回给你的 Python 脚本。

现代集群服务器的批量巡检软件，底层全是用这种方式写的。
