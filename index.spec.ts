import { parse } from "./index";
import { describe, it, expect } from "vitest";

describe("ls-json tests", () => {
  const lsOutput1 = `total 80
drwxr-xr-x  28 root   root       4096 2009-01-01 00:00 .
drwxr-xr-x  28 root   root       4096 2009-01-01 00:00 ..
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 acct
drwxr-xr-x  70 root   root       1460 2025-09-19 01:22 apex
lrw-r--r--   1 root   root         11 2009-01-01 00:00 bin -> /system/bin
lrw-r--r--   1 root   root         50 2009-01-01 00:00 bugreports -> /data/user_de/0/com.android.shell/files/bugreports
drwxrwx---   2 system cache      4096 2009-01-01 00:00 cache
drwxr-xr-x   3 root   root          0 1970-01-01 00:00 config
lrw-r--r--   1 root   root         17 2009-01-01 00:00 d -> /sys/kernel/debug
drwxrwx--x  50 system system     4096 2025-09-19 01:23 data
d?????????   ? ?      ?             ?                ? data_mirror
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 debug_ramdisk
drwxr-xr-x  21 root   root       2720 2025-09-19 01:22 dev
lrw-r--r--   1 root   root         11 2009-01-01 00:00 etc -> /system/etc
l?????????   ? ?      ?             ?                ? init -> ?
-?????????   ? ?      ?             ?                ? init.environ.rc
d?????????   ? ?      ?             ?                ? linkerconfig
drwx------   2 root   root      16384 2009-01-01 00:00 lost+found
d?????????   ? ?      ?             ?                ? metadata
drwxr-xr-x  15 root   system      320 2025-09-19 01:22 mnt
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 odm
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 odm_dlkm
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 oem
d?????????   ? ?      ?             ?                ? postinstall
dr-xr-xr-x 332 root   root          0 2025-09-19 01:22 proc
drwxr-xr-x  10 root   root       4096 2009-01-01 00:00 product
lrw-r--r--   1 root   root         21 2009-01-01 00:00 sdcard -> /storage/self/primary
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 second_stage_resources
drwx--x---   4 shell  everybody    80 2025-09-19 01:22 storage
dr-xr-xr-x  13 root   root          0 2025-09-19 01:22 sys
drwxr-xr-x  12 root   root       4096 2009-01-01 00:00 system
d?????????   ? ?      ?             ?                ? system_dlkm
drwxr-xr-x   8 root   root       4096 2009-01-01 00:00 system_ext
drwxr-xr-x  13 root   shell      4096 2009-01-01 00:00 vendor
drwxr-xr-x   2 root   root       4096 2009-01-01 00:00 vendor_dlkm`;

  const lsOutput2 = `total 160
drwxr-xr-x  12 reedchan  staff    384 Sep 19 14:51 .
drwxr-xr-x   9 reedchan  staff    288 Sep 19 14:16 ..
drwxr-xr-x   7 reedchan  staff    224 Sep 19 14:35 dist
-rw-r--r--   1 reedchan  staff   2640 Sep 19 14:51 index.spec.ts
-rw-r--r--   1 reedchan  staff  13201 Sep 19 15:10 index.ts
-rw-r--r--   1 reedchan  staff  11358 Sep 19 14:40 LICENSE
drwxr-xr-x  12 reedchan  staff    384 Sep 19 14:51 node_modules
-rw-r--r--   1 reedchan  staff   1164 Sep 19 14:51 package.json
-rw-r--r--   1 reedchan  staff  31149 Sep 19 14:51 pnpm-lock.yaml
-rw-r--r--   1 reedchan  staff   1072 Sep 19 14:40 README.md
-rw-r--r--   1 reedchan  staff    909 Sep 19 14:51 tsconfig.json
-rw-r--r--   1 reedchan  staff    366 Sep 19 14:52 vitest.config.ts`;

  const lsOutput3 = `total 160
drwxr-xr-x   7 reedchan  staff   224B Sep 19 14:35 dist
-rw-r--r--   1 reedchan  staff   2.6K Sep 19 14:51 index.spec.ts
-rw-r--r--   1 reedchan  staff    13K Sep 19 15:10 index.ts
-rw-r--r--   1 reedchan  staff    11K Sep 19 14:40 LICENSE
drwxr-xr-x  12 reedchan  staff   384B Sep 19 14:51 node_modules
-rw-r--r--   1 reedchan  staff   1.1K Sep 19 14:51 package.json
-rw-r--r--   1 reedchan  staff    30K Sep 19 14:51 pnpm-lock.yaml
-rw-r--r--   1 reedchan  staff   1.0K Sep 19 14:40 README.md
-rw-r--r--   1 reedchan  staff   909B Sep 19 14:51 tsconfig.json
-rw-r--r--   1 reedchan  staff   366B Sep 19 14:52 vitest.config.ts`;

  it("should parse ls output to json v1", () => {
    const result = parse(lsOutput1);
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should parse ls output to json v2", () => {
    const result = parse(lsOutput2);
    console.log(result);
    expect(result).toBeDefined();
  });

  it("should parse ls output to json v3", () => {
    const result = parse(lsOutput3);
    console.log(result);
    expect(result).toBeDefined();
  });
});
