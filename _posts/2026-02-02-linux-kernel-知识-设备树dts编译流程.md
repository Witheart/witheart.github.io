---
title: "设备树dts编译流程"
date: 2026-02-02
last_modified_at: 2026-02-02
categories:
  - "Linux Kernel 知识"
tags:
  - "Linux Kernel 知识"
permalink: /linux-kernel-知识/设备树dts编译流程/
toc: true
---

`kernel/Makefile`
```makefile
HOSTCC	= gcc
```

`kernel/scripts/Makefile.lib`
```makefile
quiet_cmd_dtc = DTC     $@
cmd_dtc = $(HOSTCC) -E $(dtc_cpp_flags) -x assembler-with-cpp -o $(dtc-tmp) $< ; \
	$(DTC) -O $(patsubst .%,%,$(suffix $@)) -o $@ -b 0 \
		$(addprefix -i,$(dir $<) $(DTC_INCLUDE)) $(DTC_FLAGS) \
		-d $(depfile).dtc.tmp $(dtc-tmp) ; \
	cat $(depfile).pre.tmp $(depfile).dtc.tmp > $(depfile)

dtc_cpp_flags  = -Wp,-MMD,$(depfile).pre.tmp -nostdinc                    \
		 $(addprefix -I,$(DTC_INCLUDE))                          \
		 -undef -D__DTS__
```

可以看到，设备树编译之前先用了gcc编译器进行预处理，主要是处理了include，然后展开合并，后面再用dtc进行编译。
