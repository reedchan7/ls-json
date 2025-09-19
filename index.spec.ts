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

  it("should handle octal permissions correctly including leading zeros", () => {
    const lsOutputWithSpecialPerms = `total 32
----------   1 user  user   1024 Sep 19 14:51 no_perms.txt
-rw-------   1 user  user   2048 Sep 19 14:52 owner_only.txt
-rw-rw----   1 user  user   3072 Sep 19 14:53 owner_group.txt
-rw-rw-rw-   1 user  user   4096 Sep 19 14:54 all_read_write.txt
---x--x--x   1 user  user   5120 Sep 19 14:55 execute_only.txt
drwx------   2 user  user   4096 Sep 19 14:56 private_dir`;

    const result = parse(lsOutputWithSpecialPerms);
    console.log("Special permissions:", result);
    
    expect(result).toBeDefined();
    expect(result.length).toBe(6);
    
    // Test different permission modes
    const noPerms = result.find(entry => entry.filename === 'no_perms.txt');
    expect(noPerms?.mode).toBe('000'); // 000 permissions
    
    const ownerOnly = result.find(entry => entry.filename === 'owner_only.txt');
    expect(ownerOnly?.mode).toBe('600'); // rw-------
    
    const ownerGroup = result.find(entry => entry.filename === 'owner_group.txt');
    expect(ownerGroup?.mode).toBe('660'); // rw-rw----
    
    const allReadWrite = result.find(entry => entry.filename === 'all_read_write.txt');
    expect(allReadWrite?.mode).toBe('666'); // rw-rw-rw-
    
    const executeOnly = result.find(entry => entry.filename === 'execute_only.txt');
    expect(executeOnly?.mode).toBe('111'); // --x--x--x
    
    const privateDir = result.find(entry => entry.filename === 'private_dir');
    expect(privateDir?.mode).toBe('700'); // drwx------
  });

  it("should handle permissions with leading zeros correctly", () => {
    const lsOutputWithLeadingZeros = `total 16
-------rwx   1 user  user   1024 Sep 19 14:51 others_only.txt
----rw-rw-   1 user  user   2048 Sep 19 14:52 group_others.txt`;

    const result = parse(lsOutputWithLeadingZeros);
    console.log("Leading zeros:", result);
    
    expect(result).toBeDefined();
    expect(result.length).toBe(2);
    
    // Test modes that would have leading zeros in octal
    const othersOnly = result.find(entry => entry.filename === 'others_only.txt');
    expect(othersOnly?.mode).toBe('007'); // -------rwx -> 007
    
    const groupOthers = result.find(entry => entry.filename === 'group_others.txt');
    expect(groupOthers?.mode).toBe('066'); // ----rw-rw- -> 066
  });

  it("should hide . and .. entries by default", () => {
    const lsOutputWithDots = `total 16
drwxr-xr-x   3 user  user   4096 Sep 19 14:51 .
drwxr-xr-x   5 user  user   8192 Sep 19 14:50 ..
-rw-r--r--   1 user  user   1024 Sep 19 14:51 file.txt
drwxr-xr-x   2 user  user   4096 Sep 19 14:52 subdir`;

    const result = parse(lsOutputWithDots); // 默认 showDotsDir: false
    console.log("Default (hide dots):", result.map(e => e.filename));
    
    expect(result).toBeDefined();
    expect(result.length).toBe(2); // 只有 file.txt 和 subdir
    
    // 验证 . 和 .. 不存在
    expect(result.find(entry => entry.filename === '.')).toBeUndefined();
    expect(result.find(entry => entry.filename === '..')).toBeUndefined();
    
    // 验证其他文件存在
    expect(result.find(entry => entry.filename === 'file.txt')).toBeDefined();
    expect(result.find(entry => entry.filename === 'subdir')).toBeDefined();
  });

  it("should include . and .. entries when showDotsDir is true", () => {
    const lsOutputWithDots = `total 16
drwxr-xr-x   3 user  user   4096 Sep 19 14:51 .
drwxr-xr-x   5 user  user   8192 Sep 19 14:50 ..
-rw-r--r--   1 user  user   1024 Sep 19 14:51 file.txt
drwxr-xr-x   2 user  user   4096 Sep 19 14:52 subdir`;

    const result = parse(lsOutputWithDots, { showDotsDir: true });
    console.log("Show dots:", result.map(e => e.filename));
    
    expect(result).toBeDefined();
    expect(result.length).toBe(4); // . .. file.txt subdir
    
    // 验证 . 和 .. 存在
    const dotEntry = result.find(entry => entry.filename === '.');
    expect(dotEntry).toBeDefined();
    expect(dotEntry?.type).toBe('directory');
    expect(dotEntry?.mode).toBe('755');
    
    const dotdotEntry = result.find(entry => entry.filename === '..');
    expect(dotdotEntry).toBeDefined();
    expect(dotdotEntry?.type).toBe('directory');
    expect(dotdotEntry?.mode).toBe('755');
    
    // 验证其他文件也存在
    expect(result.find(entry => entry.filename === 'file.txt')).toBeDefined();
    expect(result.find(entry => entry.filename === 'subdir')).toBeDefined();
  });
});
