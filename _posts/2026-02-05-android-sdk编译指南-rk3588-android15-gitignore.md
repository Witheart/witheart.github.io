---
title: "RK3588 Android15 .gitignore"
date: 2026-02-05
last_modified_at: 2026-02-05
categories:
  - "Android SDK编译指南"
tags:
  - "Android SDK编译指南"
permalink: /android-sdk编译指南/rk3588-android15-gitignore/
toc: true
---

```.gitignore
###############################################################################
# common
###############################################################################
*.o
*.a
*.ko
*.cmd
*.mod
*.mod.c
*.d
*.su
**/modules.order
*.S
*.lds
*.so
*.so.dbg
*.so.raw
*.asn1.[ch]
*.lex.c
*.tab.[ch]

###############################################################################
# Rockchip
###############################################################################
/out/
/rockdev/

###############################################################################
# U-Boot
###############################################################################

# config
/u-boot/.config
/u-boot/.config.old

# build artifacts
/u-boot/**/*.o
/u-boot/**/*.a
/u-boot/**/*.cmd
/u-boot/**/*.d
/u-boot/**/*.su

# device tree
/u-boot/**/*.dtb*
/u-boot/**/.dtb.cmd
/u-boot/**/*.tmp

# images & binaries
/u-boot/*.bin
/u-boot/*.img
/u-boot/System.map
/u-boot/fit/

# spl / tpl
/u-boot/spl/
/u-boot/tpl/

# generated headers
/u-boot/include/generated/
/u-boot/include/config/

# example
/u-boot/examples/standalone/hello_world
/u-boot/examples/standalone/hello_world.bin
/u-boot/examples/standalone/hello_world.srec
/u-boot/examples/standalone/rkspi
/u-boot/examples/standalone/rkspi.bin
/u-boot/examples/standalone/rkspi.srec

# other
/u-boot/u-boot
/u-boot/u-boot-nodtb.bin.digest
/u-boot/u-boot-nodtb.bin.gz
/u-boot/u-boot.cfg
/u-boot/u-boot.cfg.configs
/u-boot/u-boot.map
/u-boot/u-boot.srec
/u-boot/u-boot.sym
/u-boot/arch/arm/include/asm/arch
/u-boot/arch/arm/lib/asm-offsets.s
/u-boot/bl31.elf
/u-boot/bl31_0x00040000.bin.digest
/u-boot/bl31_0x00040000.bin.gz
/u-boot/include/autoconf.mk
/u-boot/include/autoconf.mk.dep
/u-boot/include/config.h
/u-boot/lib/asm-offsets.s
/u-boot/scripts/basic/fixdep
/u-boot/scripts/dtc/dtc
/u-boot/scripts/kconfig/conf
/u-boot/scripts/kconfig/zconf.hash.c
/u-boot/tee.bin.digest
/u-boot/tee.bin.gz
/u-boot/tools/bmp2gray16
/u-boot/tools/common/
/u-boot/tools/dumpimage
/u-boot/tools/fdtgrep
/u-boot/tools/gen_eth_addr
/u-boot/tools/gen_ethaddr_crc
/u-boot/tools/lib/
/u-boot/tools/mkenvimage
/u-boot/tools/mkimage
/u-boot/tools/proftool
/u-boot/tools/relocate-rela
/u-boot/tools/resource_tool

###############################################################################
# Linux Kernel (Kbuild generated)
###############################################################################

# config
/kernel-6.1/.config
/kernel-6.1/.config.old

# generated headers & tables
/kernel-6.1/include/generated/
/kernel-6.1/arch/arm64/include/generated/
/kernel-6.1/include/config/
/kernel-6.1/**/asm-offsets.s
/kernel-6.1/**/bounds.s

# kernel images & symbols
/kernel-6.1/*.img
/kernel-6.1/vmlinux
/kernel-6.1/vmlinux.symvers
/kernel-6.1/System.map
/kernel-6.1/Module.symvers
/kernel-6.1/.tmp_vmlinux*
/kernel-6.1/.vmlinux*
/kernel-6.1/arch/arm64/boot/Image
/kernel-6.1/arch/arm64/boot/Image.lz4

# device tree blobs
*.dtb
*.dtb.d.dtc.tmp
*.dtb.d.pre.tmp
*.dtb.dts.tmp

# scripts & host tools
/kernel-6.1/scripts/asn1_compiler
/kernel-6.1/scripts/basic/fixdep
/kernel-6.1/scripts/dtc/dtc
/kernel-6.1/scripts/dtc/fdtoverlay
/kernel-6.1/scripts/genksyms/genksyms
/kernel-6.1/scripts/kconfig/conf
/kernel-6.1/scripts/mod/modpost
/kernel-6.1/scripts/kallsyms
/kernel-6.1/scripts/mod/devicetable-offsets.h
/kernel-6.1/scripts/mod/devicetable-offsets.s
/kernel-6.1/scripts/mod/elfconfig.h
/kernel-6.1/scripts/mod/mk_elfconfig
/kernel-6.1/scripts/mod/mk_elfconfig
/kernel-6.1/scripts/resource_tool
/kernel-6.1/scripts/selinux/genheaders/genheaders
/kernel-6.1/scripts/selinux/mdp/mdp
/kernel-6.1/scripts/sign-file
/kernel-6.1/scripts/sorttable
/kernel-6.1/scripts/unifdef

# initramfs & usr
/kernel-6.1/usr/include/linux/
/kernel-6.1/usr/gen_init_cpio
/kernel-6.1/usr/include/asm-generic/
/kernel-6.1/usr/include/asm/
/kernel-6.1/usr/include/base/
/kernel-6.1/usr/include/drm/
/kernel-6.1/usr/include/gpu/
/kernel-6.1/usr/include/misc/
/kernel-6.1/usr/include/mtd/
/kernel-6.1/usr/include/rdma/
/kernel-6.1/usr/include/scsi/
/kernel-6.1/usr/include/sound/
/kernel-6.1/usr/include/video/
/kernel-6.1/usr/include/xen/
/kernel-6.1/usr/initramfs_data.cpio
/kernel-6.1/usr/initramfs_inc_data

# log
/kernel-6.1/**/*.log

# certificate
/kernel-6.1/certs/signing_key.*
/kernel-6.1/certs/x509*
/kernel-6.1/**/*.genkey

# other
/kernel-6.1/.checked-atomic-*
/kernel-6.1/.version
/kernel-6.1/modules.builtin
/kernel-6.1/modules.builtin.modinfo
/kernel-6.1/arch/arm/vdso/vdsomunge
/kernel-6.1/arch/arm64/kvm/hyp-constants.s
/kernel-6.1/arch/arm64/kvm/hyp_constants.h
/kernel-6.1/arch/arm64/tools/gen-hyprel
/kernel-6.1/certs/extract-cert
/kernel-6.1/drivers/scsi/scsi_devinfo_tbl.c
/kernel-6.1/fs/unicode/utf8data.c
/kernel-6.1/init/utsversion-tmp.h
/kernel-6.1/kernel/config_data
/kernel-6.1/kernel/config_data.gz
/kernel-6.1/kernel/kheaders.md5
/kernel-6.1/kernel/kheaders_data.tar.xz
/kernel-6.1/lib/crc32table.h
/kernel-6.1/lib/gen_crc32table
/kernel-6.1/lib/oid_registry_data.c
/kernel-6.1/net/wireless/shipped-certs.c
/kernel-6.1/security/selinux/av_permissions.h
/kernel-6.1/security/selinux/flask.h
/kernel-6.1/tools/bpf/resolve_btfids/fixdep
/kernel-6.1/tools/bpf/resolve_btfids/libbpf/
/kernel-6.1/tools/bpf/resolve_btfids/libsubcmd/
/kernel-6.1/tools/bpf/resolve_btfids/resolve_btfids

###############################################################################
# Rockchip / Android pack
###############################################################################

/RKTools/linux/Linux_Pack_Firmware/rockdev/package-file-tmp

###############################################################################
# External WiFi driver (out-of-tree kernel module)
###############################################################################

/external/wifi_driver/**/Module.symvers
/external/wifi_driver/**/modules.order

# generated version header
/external/wifi_driver/**/version.h
```
