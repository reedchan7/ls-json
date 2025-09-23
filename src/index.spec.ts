import { parse } from "./index";
import { describe, it, expect, beforeEach } from "vitest";

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
drwxr-xr-x  12 user  staff    384 Sep 19 14:51 .
drwxr-xr-x   9 user  staff    288 Sep 19 14:16 ..
drwxr-xr-x   7 user  staff    224 Sep 19 14:35 dist
-rw-r--r--   1 user  staff   2640 Sep 19 14:51 index.spec.ts
-rw-r--r--   1 user  staff  13201 Sep 19 15:10 index.ts
-rw-r--r--   1 user  staff  11358 Sep 19 14:40 LICENSE
drwxr-xr-x  12 user  staff    384 Sep 19 14:51 node_modules
-rw-r--r--   1 user  staff   1164 Sep 19 14:51 package.json
-rw-r--r--   1 user  staff  31149 Sep 19 14:51 pnpm-lock.yaml
-rw-r--r--   1 user  staff   1072 Sep 19 14:40 README.md
-rw-r--r--   1 user  staff    909 Sep 19 14:51 tsconfig.json
-rw-r--r--   1 user  staff    366 Sep 19 14:52 vitest.config.ts`;

  const lsOutput3 = `total 160
drwxr-xr-x   7 user  staff   224B Sep 19 14:35 dist
-rw-r--r--   1 user  staff   2.6K Sep 19 14:51 index.spec.ts
-rw-r--r--   1 user  staff    13K Sep 19 15:10 index.ts
-rw-r--r--   1 user  staff    11K Sep 19 14:40 LICENSE
drwxr-xr-x  12 user  staff   384B Sep 19 14:51 node_modules
-rw-r--r--   1 user  staff   1.1K Sep 19 14:51 package.json
-rw-r--r--   1 user  staff    30K Sep 19 14:51 pnpm-lock.yaml
-rw-r--r--   1 user  staff   1.0K Sep 19 14:40 README.md
-rw-r--r--   1 user  staff   909B Sep 19 14:51 tsconfig.json
-rw-r--r--   1 user  staff   366B Sep 19 14:52 vitest.config.ts`;

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
    const noPerms = result.find((entry) => entry.filename === "no_perms.txt");
    expect(noPerms?.mode).toBe("000"); // 000 permissions

    const ownerOnly = result.find(
      (entry) => entry.filename === "owner_only.txt",
    );
    expect(ownerOnly?.mode).toBe("600"); // rw-------

    const ownerGroup = result.find(
      (entry) => entry.filename === "owner_group.txt",
    );
    expect(ownerGroup?.mode).toBe("660"); // rw-rw----

    const allReadWrite = result.find(
      (entry) => entry.filename === "all_read_write.txt",
    );
    expect(allReadWrite?.mode).toBe("666"); // rw-rw-rw-

    const executeOnly = result.find(
      (entry) => entry.filename === "execute_only.txt",
    );
    expect(executeOnly?.mode).toBe("111"); // --x--x--x

    const privateDir = result.find((entry) => entry.filename === "private_dir");
    expect(privateDir?.mode).toBe("700"); // drwx------
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
    const othersOnly = result.find(
      (entry) => entry.filename === "others_only.txt",
    );
    expect(othersOnly?.mode).toBe("007"); // -------rwx -> 007

    const groupOthers = result.find(
      (entry) => entry.filename === "group_others.txt",
    );
    expect(groupOthers?.mode).toBe("066"); // ----rw-rw- -> 066
  });

  it("should hide . and .. entries by default", () => {
    const lsOutputWithDots = `total 16
drwxr-xr-x   3 user  user   4096 Sep 19 14:51 .
drwxr-xr-x   5 user  user   8192 Sep 19 14:50 ..
-rw-r--r--   1 user  user   1024 Sep 19 14:51 file.txt
drwxr-xr-x   2 user  user   4096 Sep 19 14:52 subdir`;

    const result = parse(lsOutputWithDots); // 默认 showDotsDir: false
    console.log(
      "Default (hide dots):",
      result.map((e) => e.filename),
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(2); // 只有 file.txt 和 subdir

    // 验证 . 和 .. 不存在
    expect(result.find((entry) => entry.filename === ".")).toBeUndefined();
    expect(result.find((entry) => entry.filename === "..")).toBeUndefined();

    // 验证其他文件存在
    expect(result.find((entry) => entry.filename === "file.txt")).toBeDefined();
    expect(result.find((entry) => entry.filename === "subdir")).toBeDefined();
  });

  it("should include . and .. entries when showDotsDir is true", () => {
    const lsOutputWithDots = `total 16
drwxr-xr-x   3 user  user   4096 Sep 19 14:51 .
drwxr-xr-x   5 user  user   8192 Sep 19 14:50 ..
-rw-r--r--   1 user  user   1024 Sep 19 14:51 file.txt
drwxr-xr-x   2 user  user   4096 Sep 19 14:52 subdir`;

    const result = parse(lsOutputWithDots, { showDotsDir: true });
    console.log(
      "Show dots:",
      result.map((e) => e.filename),
    );

    expect(result).toBeDefined();
    expect(result.length).toBe(4); // . .. file.txt subdir

    // 验证 . 和 .. 存在
    const dotEntry = result.find((entry) => entry.filename === ".");
    expect(dotEntry).toBeDefined();
    expect(dotEntry?.type).toBe("directory");
    expect(dotEntry?.mode).toBe("755");

    const dotdotEntry = result.find((entry) => entry.filename === "..");
    expect(dotdotEntry).toBeDefined();
    expect(dotdotEntry?.type).toBe("directory");
    expect(dotdotEntry?.mode).toBe("755");

    // 验证其他文件也存在
    expect(result.find((entry) => entry.filename === "file.txt")).toBeDefined();
    expect(result.find((entry) => entry.filename === "subdir")).toBeDefined();
  });
});

describe("Unified parse function tests", () => {
  const lsOutput = `total 160
drwxr-xr-x  12 user  staff    384 Sep 19 14:51 .
drwxr-xr-x   9 user  staff    288 Sep 19 14:16 ..
-rw-r--r--   1 user  staff   1164 Sep 19 14:51 package.json
-rw-r--r--   1 user  staff   1072 Sep 19 14:40 README.md`;

  const recursiveOutput = `/home:
total 8
-rw-r--r-- 1 user user 1024 2009-01-01 00:00 file.txt
drwxr-xr-x 2 user user 4096 2009-01-01 00:00 subdir

/home/subdir:
total 4
-rw-r--r-- 1 user user 128 2009-01-01 00:00 nested.txt`;

  it("should parse standard ls output by default", () => {
    const result = parse(lsOutput);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2); // package.json and README.md (. and .. are hidden)
  });

  it("should parse recursive ls output with recursive option", () => {
    const result = parse(recursiveOutput, { recursive: true });
    expect(result).toHaveProperty("directories");
    expect(result).toHaveProperty("getAllEntries");
    expect(result.directories).toHaveLength(2);
  });

  it("should support depth limiting in recursive mode", () => {
    const deepRecursive = `/level0:
total 4
drwxr-xr-x 2 user user 4096 2009-01-01 00:00 level1

/level0/level1:
total 4
drwxr-xr-x 2 user user 4096 2009-01-01 00:00 level2

/level0/level1/level2:
total 4
-rw-r--r-- 1 user user 128 2009-01-01 00:00 deep.txt`;

    const result = parse(deepRecursive, { recursive: true, depth: 1 });
    expect(result.directories).toHaveLength(2); // Should stop at depth 1
  });

  it("should provide traversal methods for recursive results", () => {
    const result = parse(recursiveOutput, { recursive: true });

    // Test getAllEntries
    const allEntries = result.getAllEntries();
    expect(allEntries).toHaveLength(3); // file.txt, subdir, and nested.txt (dots are hidden)

    // Test findEntry
    const fileEntry = result.findEntry(
      (entry) => entry.filename === "file.txt",
    );
    expect(fileEntry).toBeDefined();
    expect(fileEntry?.parent).toBe("/home");

    // Test getEntriesByPath
    const homeEntries = result.getEntriesByPath("/home");
    expect(homeEntries).toHaveLength(2); // file.txt and subdir (dots are hidden by default)

    // Test filterEntries
    const txtFiles = result.filterEntries((entry) =>
      entry.filename.endsWith(".txt"),
    );
    expect(txtFiles).toHaveLength(2); // file.txt and nested.txt

    // Test getDirectoryTree
    const tree = result.getDirectoryTree();
    expect(Object.keys(tree)).toHaveLength(2);
    expect(tree["/home"]).toBeDefined();
    expect(tree["/home/subdir"]).toBeDefined();
  });

  it("should support traverse method", () => {
    const result = parse(recursiveOutput, { recursive: true });

    const traversedFiles: string[] = [];
    result.traverse((entry, directory) => {
      traversedFiles.push(`${directory.path}/${entry.filename}`);
    });

    expect(traversedFiles).toHaveLength(3); // file.txt, subdir, nested.txt
    expect(traversedFiles).toContain("/home/file.txt");
    expect(traversedFiles).toContain("/home/subdir");
    expect(traversedFiles).toContain("/home/subdir/nested.txt");
  });
});

describe("Comprehensive LsRecursiveOutput method tests", () => {
  const complexRecursiveOutput = `/vendor:
total 68
drwxr-xr-x 13 root shell  4096 2009-01-01 00:00 .
drwxr-xr-x 28 root root   4096 2009-01-01 00:00 ..
drwxr-xr-x  2 root shell  4096 2009-01-01 00:00 apex
drwxr-x--x  3 root shell  4096 2009-01-01 00:00 bin
-?????????  ? ?    ?         ?                ? build.prop
drwxr-xr-x 10 root shell  4096 2009-01-01 00:00 etc
drwxr-xr-x  3 root shell  4096 2009-01-01 00:00 lib
drwxr-xr-x  7 root shell  8192 2009-01-01 00:00 lib64

/vendor/apex:
total 4108
drwxr-xr-x  2 root shell    4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell    4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root  4227072 2009-01-01 00:00 com.google.android.widevine.nonupdatable.apex

/vendor/bin:
total 320
drwxr-x--x  3 root shell   4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell   4096 2009-01-01 00:00 ..
l?????????  ? ?    ?          ?                ? [ -> ?
-rwxr-xr-x  1 root shell 340712 2009-01-01 00:00 sh
drwxr-x--x  2 root shell   4096 2009-01-01 00:00 hw

/vendor/bin/hw:
total 8
drwxr-x--x 2 root shell 4096 2009-01-01 00:00 .
drwxr-x--x 3 root shell 4096 2009-01-01 00:00 ..
-?????????  ? ?    ?        ?                ? android.hardware.atrace@1.0-service
-?????????  ? ?    ?        ?                ? android.hardware.wifi-service

/vendor/etc:
total 376
drwxr-xr-x 10 root shell   4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell   4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root  190463 2009-01-01 00:00 NOTICE.xml.gz
-rw-r--r--  1 root root    7544 2009-01-01 00:00 audio_effects.xml
drwxr-xr-x  2 root shell   4096 2009-01-01 00:00 config
drwxr-xr-x  3 root shell   4096 2009-01-01 00:00 init
drwxr-xr-x  2 root shell   4096 2009-01-01 00:00 wifi

/vendor/etc/config:
total 92
drwxr-xr-x  2 root shell  4096 2009-01-01 00:00 .
drwxr-xr-x 10 root shell  4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root  12628 2009-01-01 00:00 emu_camera_back.json
-rw-r--r--  1 root root   7600 2009-01-01 00:00 emu_camera_depth.json
-rw-r--r--  1 root root  58438 2009-01-01 00:00 emu_camera_front.json

ls: /vendor/restricted: Permission denied

/vendor/lib:
total 12
drwxr-xr-x  3 root shell 4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell 4096 2009-01-01 00:00 ..
drwxr-xr-x  2 root shell 4096 2009-01-01 00:00 modules

/vendor/lib/modules:
total 8
drwxr-xr-x 2 root shell 4096 2009-01-01 00:00 .
drwxr-xr-x 3 root shell 4096 2009-01-01 00:00 ..
-?????????  ? ?    ?        ?                ? goldfish_pipe.ko
-?????????  ? ?    ?        ?                ? virtio-gpu.ko`;

  let result: any; // Use any to access methods

  beforeEach(() => {
    result = parse(complexRecursiveOutput, { recursive: true });
  });

  describe("getAllEntries method", () => {
    it("should return all entries from all directories", () => {
      const allEntries = result.getAllEntries();
      
      // Should include all valid entries (excluding dots and unknown permissions)
      expect(allEntries.length).toBeGreaterThan(10);
      
      // Check for specific entries from different directories
      const filenames = allEntries.map((entry: any) => entry.filename);
      expect(filenames).toContain("apex");
      expect(filenames).toContain("bin");
      expect(filenames).toContain("com.google.android.widevine.nonupdatable.apex");
      expect(filenames).toContain("sh");
      expect(filenames).toContain("hw");
      expect(filenames).toContain("NOTICE.xml.gz");
      expect(filenames).toContain("config");
      expect(filenames).toContain("emu_camera_back.json");
      expect(filenames).toContain("modules");
    });

    it("should include parent path information for all entries", () => {
      const allEntries = result.getAllEntries();
      
      allEntries.forEach((entry: any) => {
        expect(entry).toHaveProperty('parent');
        expect(typeof entry.parent).toBe('string');
        expect(entry.parent.startsWith('/vendor')).toBe(true);
      });
    });

    it("should return entries with correct types", () => {
      const allEntries = result.getAllEntries();
      
      const shEntry = allEntries.find((e: any) => e.filename === 'sh');
      expect(shEntry?.type).toBe('file');
      
      const apexEntry = allEntries.find((e: any) => e.filename === 'apex');
      expect(apexEntry?.type).toBe('directory');
      
      const configEntry = allEntries.find((e: any) => e.filename === 'config');
      expect(configEntry?.type).toBe('directory');
    });
  });

  describe("findEntry method", () => {
    it("should find entry by filename", () => {
      const shEntry = result.findEntry((entry: any) => entry.filename === 'sh');
      
      expect(shEntry).toBeDefined();
      expect(shEntry.filename).toBe('sh');
      expect(shEntry.type).toBe('file');
      expect(shEntry.parent).toBe('/vendor/bin');
      expect(shEntry.size).toBe(340712);
    });

    it("should find entry by multiple conditions", () => {
      const largeFile = result.findEntry((entry: any) => 
        entry.type === 'file' && entry.size > 1000000
      );
      
      expect(largeFile).toBeDefined();
      expect(largeFile.filename).toBe('com.google.android.widevine.nonupdatable.apex');
      expect(largeFile.size).toBe(4227072);
      expect(largeFile.parent).toBe('/vendor/apex');
    });

    it("should find directory by type", () => {
      const hwDir = result.findEntry((entry: any) => 
        entry.filename === 'hw' && entry.type === 'directory'
      );
      
      expect(hwDir).toBeDefined();
      expect(hwDir.type).toBe('directory');
      expect(hwDir.parent).toBe('/vendor/bin');
    });

    it("should return undefined for non-existent entry", () => {
      const nonExistent = result.findEntry((entry: any) => entry.filename === 'nonexistent.txt');
      expect(nonExistent).toBeUndefined();
    });

    it("should find entry by owner", () => {
      const rootOwnedFile = result.findEntry((entry: any) => 
        entry.owner === 'root' && entry.group === 'root' && entry.type === 'file'
      );
      
      expect(rootOwnedFile).toBeDefined();
      expect(rootOwnedFile.owner).toBe('root');
      expect(rootOwnedFile.group).toBe('root');
    });
  });

  describe("filterEntries method", () => {
    it("should filter files only", () => {
      const files = result.filterEntries((entry: any) => entry.type === 'file');
      
      expect(files.length).toBeGreaterThan(0);
      files.forEach((file: any) => {
        expect(file.type).toBe('file');
      });
      
      const filenames = files.map((f: any) => f.filename);
      expect(filenames).toContain('sh');
      expect(filenames).toContain('com.google.android.widevine.nonupdatable.apex');
      expect(filenames).toContain('NOTICE.xml.gz');
    });

    it("should filter directories only", () => {
      const directories = result.filterEntries((entry: any) => entry.type === 'directory');
      
      expect(directories.length).toBeGreaterThan(0);
      directories.forEach((dir: any) => {
        expect(dir.type).toBe('directory');
      });
      
      const dirNames = directories.map((d: any) => d.filename);
      expect(dirNames).toContain('apex');
      expect(dirNames).toContain('bin');
      expect(dirNames).toContain('config');
      expect(dirNames).toContain('hw');
    });

    it("should filter by file extension", () => {
      const xmlFiles = result.filterEntries((entry: any) => 
        entry.filename.endsWith('.xml')
      );
      
      expect(xmlFiles.length).toBeGreaterThan(0);
      xmlFiles.forEach((file: any) => {
        expect(file.filename.endsWith('.xml')).toBe(true);
      });
    });

    it("should filter by size range", () => {
      const largeFiles = result.filterEntries((entry: any) => 
        entry.type === 'file' && entry.size > 100000
      );
      
      expect(largeFiles.length).toBeGreaterThan(0);
      largeFiles.forEach((file: any) => {
        expect(file.size).toBeGreaterThan(100000);
      });
    });

    it("should filter by specific path", () => {
      const etcFiles = result.filterEntries((entry: any) => 
        entry.parent && entry.parent.startsWith('/vendor/etc')
      );
      
      expect(etcFiles.length).toBeGreaterThan(0);
      etcFiles.forEach((file: any) => {
        expect(file.parent.startsWith('/vendor/etc')).toBe(true);
      });
    });

    it("should filter by permissions", () => {
      const executableFiles = result.filterEntries((entry: any) => 
        entry.flags && entry.flags.includes('x') && entry.type === 'file'
      );
      
      const shFile = executableFiles.find((f: any) => f.filename === 'sh');
      expect(shFile).toBeDefined();
      expect(shFile.flags).toContain('x');
    });

    it("should return empty array when no matches", () => {
      const noMatches = result.filterEntries((entry: any) => 
        entry.filename === 'impossible-to-match-filename'
      );
      
      expect(noMatches).toEqual([]);
    });
  });

  describe("getEntriesByPath method", () => {
    it("should get entries for root vendor path", () => {
      const vendorEntries = result.getEntriesByPath('/vendor');
      
      expect(vendorEntries).toBeDefined();
      expect(vendorEntries!.length).toBeGreaterThan(0);
      
      const filenames = vendorEntries!.map((e: any) => e.filename);
      expect(filenames).toContain('apex');
      expect(filenames).toContain('bin');
      expect(filenames).toContain('etc');
      expect(filenames).toContain('lib');
    });

    it("should get entries for nested paths", () => {
      const configEntries = result.getEntriesByPath('/vendor/etc/config');
      
      expect(configEntries).toBeDefined();
      expect(configEntries!.length).toBeGreaterThan(0);
      
      const filenames = configEntries!.map((e: any) => e.filename);
      expect(filenames).toContain('emu_camera_back.json');
      expect(filenames).toContain('emu_camera_depth.json');
      expect(filenames).toContain('emu_camera_front.json');
    });

    it("should get entries for bin/hw path", () => {
      const hwEntries = result.getEntriesByPath('/vendor/bin/hw');
      
      expect(hwEntries).toBeDefined();
      expect(hwEntries!.length).toBe(0); // No valid entries due to unknown permissions
    });

    it("should return undefined for non-existent path", () => {
      const nonExistentEntries = result.getEntriesByPath('/vendor/nonexistent');
      
      expect(nonExistentEntries).toBeUndefined();
    });

    it("should return entries with correct parent paths", () => {
      const apexEntries = result.getEntriesByPath('/vendor/apex');
      
      expect(apexEntries).toBeDefined();
      apexEntries!.forEach((entry: any) => {
        expect(entry.parent).toBe('/vendor/apex');
      });
    });
  });

  describe("getDirectoryTree method", () => {
    it("should return tree with all directory paths as keys", () => {
      const tree = result.getDirectoryTree();
      
      expect(tree).toHaveProperty('/vendor');
      expect(tree).toHaveProperty('/vendor/apex');
      expect(tree).toHaveProperty('/vendor/bin');
      expect(tree).toHaveProperty('/vendor/bin/hw');
      expect(tree).toHaveProperty('/vendor/etc');
      expect(tree).toHaveProperty('/vendor/etc/config');
      expect(tree).toHaveProperty('/vendor/lib');
      expect(tree).toHaveProperty('/vendor/lib/modules');
    });

    it("should have entries arrays for each directory", () => {
      const tree = result.getDirectoryTree();
      
      Object.keys(tree).forEach(path => {
        expect(Array.isArray(tree[path])).toBe(true);
      });
    });

    it("should have correct entries for each directory", () => {
      const tree = result.getDirectoryTree();
      
      const vendorEntries = tree['/vendor'];
      const vendorFilenames = vendorEntries.map((e: any) => e.filename);
      expect(vendorFilenames).toContain('apex');
      expect(vendorFilenames).toContain('bin');
      expect(vendorFilenames).toContain('etc');
      
      const configEntries = tree['/vendor/etc/config'];
      const configFilenames = configEntries.map((e: any) => e.filename);
      expect(configFilenames).toContain('emu_camera_back.json');
    });

    it("should maintain parent relationship consistency", () => {
      const tree = result.getDirectoryTree();
      
      Object.keys(tree).forEach(path => {
        const entries = tree[path];
        entries.forEach((entry: any) => {
          expect(entry.parent).toBe(path);
        });
      });
    });
  });

  describe("traverse method", () => {
    it("should traverse all entries with callback", () => {
      const traversedEntries: any[] = [];
      const traversedPaths: string[] = [];
      
      result.traverse((entry: any, directory: any) => {
        traversedEntries.push(entry);
        traversedPaths.push(directory.path);
      });
      
      expect(traversedEntries.length).toBeGreaterThan(10);
      expect(traversedPaths.length).toBeGreaterThan(10);
      
      // Should include entries from different directories
      const filenames = traversedEntries.map(e => e.filename);
      expect(filenames).toContain('apex');
      expect(filenames).toContain('sh');
      expect(filenames).toContain('NOTICE.xml.gz');
      expect(filenames).toContain('emu_camera_back.json');
    });

    it("should provide correct directory context in callback", () => {
      const pathEntryMap: { [key: string]: string[] } = {};
      
      result.traverse((entry: any, directory: any) => {
        if (!pathEntryMap[directory.path]) {
          pathEntryMap[directory.path] = [];
        }
        pathEntryMap[directory.path]!.push(entry.filename);
      });
      
      expect(pathEntryMap['/vendor']).toBeDefined();
      expect(pathEntryMap['/vendor']).toContain('apex');
      expect(pathEntryMap['/vendor']).toContain('bin');
      expect(pathEntryMap['/vendor/apex']).toBeDefined();
      expect(pathEntryMap['/vendor/apex']).toContain('com.google.android.widevine.nonupdatable.apex');
      expect(pathEntryMap['/vendor/bin']).toBeDefined();
      expect(pathEntryMap['/vendor/bin']).toContain('sh');
      expect(pathEntryMap['/vendor/etc/config']).toBeDefined();
      expect(pathEntryMap['/vendor/etc/config']).toContain('emu_camera_back.json');
    });

    it("should allow modifying external state during traversal", () => {
      let fileCount = 0;
      let dirCount = 0;
      let totalSize = 0;
      
      result.traverse((entry: any, directory: any) => {
        if (entry.type === 'file') {
          fileCount++;
          if (typeof entry.size === 'number') {
            totalSize += entry.size;
          }
        } else if (entry.type === 'directory') {
          dirCount++;
        }
      });
      
      expect(fileCount).toBeGreaterThan(0);
      expect(dirCount).toBeGreaterThan(0);
      expect(totalSize).toBeGreaterThan(0);
    });

    it("should visit entries in directory order", () => {
      const visitOrder: string[] = [];
      
      result.traverse((entry: any, directory: any) => {
        visitOrder.push(`${directory.path}/${entry.filename}`);
      });
      
      // Check that /vendor entries come before /vendor/apex entries
      const vendorApexIndex = visitOrder.findIndex(path => path.startsWith('/vendor/apex/'));
      const vendorBinIndex = visitOrder.findIndex(path => path.startsWith('/vendor/bin/'));
      const lastVendorRootIndex = visitOrder.map((path, idx) => 
        path.startsWith('/vendor/') && !path.includes('/', 8) ? idx : -1
      ).filter(idx => idx !== -1).pop() || -1;
      
      expect(vendorApexIndex).toBeGreaterThan(lastVendorRootIndex);
      expect(vendorBinIndex).toBeGreaterThan(lastVendorRootIndex);
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle empty recursive output", () => {
      const emptyResult = parse('', { recursive: true });
      
      expect(emptyResult.directories).toEqual([]);
      expect(emptyResult.getAllEntries()).toEqual([]);
      expect(emptyResult.findEntry(() => true)).toBeUndefined();
      expect(emptyResult.filterEntries(() => true)).toEqual([]);
      expect(emptyResult.getEntriesByPath('/any/path')).toBeUndefined();
      expect(emptyResult.getDirectoryTree()).toEqual({});
      
      let callbackCalled = false;
      emptyResult.traverse(() => { callbackCalled = true; });
      expect(callbackCalled).toBe(false);
    });

    it("should handle single directory with no entries", () => {
      const singleEmptyDir = `/empty:
total 0
drwxr-xr-x 2 user user 4096 2009-01-01 00:00 .
drwxr-xr-x 3 user user 4096 2009-01-01 00:00 ..`;

      const singleResult = parse(singleEmptyDir, { recursive: true });
      
      expect(singleResult.directories).toHaveLength(1);
      expect(singleResult.getAllEntries()).toEqual([]);
      expect(singleResult.getEntriesByPath('/empty')).toEqual([]);
      
      let traverseCount = 0;
      singleResult.traverse(() => { traverseCount++; });
      expect(traverseCount).toBe(0);
    });

    it("should handle directories with only errors", () => {
      const errorOnlyOutput = `ls: /restricted: Permission denied`;

      const errorResult = parse(errorOnlyOutput, { recursive: true });
      
      expect(errorResult.directories).toHaveLength(0);
      expect(errorResult.errors).toBeDefined();
      expect(errorResult.errors![0]).toContain('Permission denied');
    });
  });

  describe("Performance and consistency", () => {
    it("should maintain consistency between different access methods", () => {
      // getAllEntries should equal sum of all getEntriesByPath results
      const allEntries = result.getAllEntries();
      const tree = result.getDirectoryTree();
      
      let treeEntriesCount = 0;
      Object.keys(tree).forEach(path => {
        treeEntriesCount += tree[path].length;
      });
      
      expect(allEntries.length).toBe(treeEntriesCount);
    });

    it("should maintain consistency between traverse and other methods", () => {
      const allEntries = result.getAllEntries();
      
      let traverseCount = 0;
      result.traverse(() => { traverseCount++; });
      
      expect(allEntries.length).toBe(traverseCount);
    });

    it("should return same instances for repeated calls", () => {
      const firstCall = result.getAllEntries();
      const secondCall = result.getAllEntries();
      
      expect(firstCall.length).toBe(secondCall.length);
      // Objects should have same data even if not same instances
      expect(firstCall[0]).toEqual(secondCall[0]);
    });
  });

  describe("Options and parameter testing", () => {
    it("should work with showDotsDir option", () => {
      const resultWithDots = parse(complexRecursiveOutput, { 
        recursive: true, 
        showDotsDir: true 
      });

      const tree = resultWithDots.getDirectoryTree();
      const vendorEntries = tree['/vendor'];
      
      expect(vendorEntries).toBeDefined();
      const filenames = vendorEntries!.map((e: any) => e.filename);
      
      expect(filenames).toContain('.');
      expect(filenames).toContain('..');
      expect(filenames).toContain('apex');
      expect(filenames).toContain('bin');
    });

    it("should work with depth limiting", () => {
      const resultWithDepth = parse(complexRecursiveOutput, { 
        recursive: true, 
        depth: 1 
      });

      const tree = resultWithDepth.getDirectoryTree();
      const paths = Object.keys(tree);
      
      // With depth=1, should include:
      // - /vendor (depth 0)
      // - /vendor/apex, /vendor/bin, /vendor/etc, /vendor/lib (depth 1)
      // But NOT:
      // - /vendor/bin/hw, /vendor/etc/config, /vendor/lib/modules (depth 2, > depth limit)
      expect(paths).toContain('/vendor');
      expect(paths).toContain('/vendor/apex');
      expect(paths).toContain('/vendor/bin');
      expect(paths).toContain('/vendor/etc');
      expect(paths).toContain('/vendor/lib');
      
      expect(paths).not.toContain('/vendor/bin/hw');
      expect(paths).not.toContain('/vendor/etc/config');
      expect(paths).not.toContain('/vendor/lib/modules');
    });

    it("should work with raw option", () => {
      const resultRaw = parse(complexRecursiveOutput, { 
        recursive: true, 
        raw: true 
      });

      const allEntries = resultRaw.getAllEntries();
      expect(allEntries.length).toBeGreaterThan(0);
      
      // Raw option should still produce valid entries
      allEntries.forEach((entry: any) => {
        expect(entry).toHaveProperty('filename');
        expect(entry).toHaveProperty('type');
        expect(entry).toHaveProperty('parent');
      });
    });

    it("should handle combined options", () => {
      const resultCombined = parse(complexRecursiveOutput, { 
        recursive: true, 
        showDotsDir: true,
        depth: 1,
        raw: false
      });

      const tree = resultCombined.getDirectoryTree();
      
      // Should have depth-limited directories (depth=1, so only depth 0 and 1)
      expect(tree).toHaveProperty('/vendor');
      expect(tree).toHaveProperty('/vendor/etc'); // depth 1
      expect(tree).not.toHaveProperty('/vendor/etc/config'); // depth 2, > depth limit
      expect(tree).not.toHaveProperty('/vendor/lib/modules'); // depth 2, > depth limit
      
      // Should include dot entries
      const vendorEntries = tree['/vendor'];
      expect(vendorEntries).toBeDefined();
      const filenames = vendorEntries!.map((e: any) => e.filename);
      expect(filenames).toContain('.');
      expect(filenames).toContain('..');
    });
  });

  describe("Real-world Android ls output tests", () => {
    const realWorldOutput = `/product/app:
total 108
drwxr-xr-x 27 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 10 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x  3 root root 4096 2009-01-01 00:00 CalendarGooglePrebuilt
drwxr-xr-x  4 root root 4096 2009-01-01 00:00 Camera2
drwxr-xr-x  2 root root 4096 2009-01-01 00:00 Chrome
drwxr-xr-x  2 root root 4096 2009-01-01 00:00 Chrome-Stub

/product/app/CalendarGooglePrebuilt:
total 37888
drwxr-xr-x  3 root root     4096 2009-01-01 00:00 .
drwxr-xr-x 27 root root     4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root 38783606 2009-01-01 00:00 CalendarGooglePrebuilt.apk
drwxr-xr-x  3 root root     4096 2009-01-01 00:00 oat

/product/app/CalendarGooglePrebuilt/oat:
total 12
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 arm64

/product/app/CalendarGooglePrebuilt/oat/arm64:
total 1104
drwxr-xr-x 2 root root   4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root   4096 2009-01-01 00:00 ..
-rw-r--r-- 1 root root 267192 2009-01-01 00:00 CalendarGooglePrebuilt.odex
-rw-r--r-- 1 root root 846580 2009-01-01 00:00 CalendarGooglePrebuilt.vdex

/product/app/Camera2:
total 7880
drwxr-xr-x  4 root root    4096 2009-01-01 00:00 .
drwxr-xr-x 27 root root    4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root 8050927 2009-01-01 00:00 Camera2.apk
drwxr-xr-x  3 root root    4096 2009-01-01 00:00 lib
drwxr-xr-x  3 root root    4096 2009-01-01 00:00 oat

/product/app/Camera2/lib:
total 12
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 4 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 arm64

/product/app/Camera2/lib/arm64:
total 396
drwxr-xr-x 2 root root   4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root   4096 2009-01-01 00:00 ..
-rw-r--r-- 1 root root 406488 2009-01-01 00:00 libjni_jpegutil.so
-rw-r--r-- 1 root root 133384 2009-01-01 00:00 libjni_tinyplanet.so`;

    it("should parse complex nested Android directory structure", () => {
      const androidResult = parse(realWorldOutput, { recursive: true });

      expect(androidResult.directories.length).toBe(7);
      
      const tree = androidResult.getDirectoryTree();
      expect(tree).toHaveProperty('/product/app');
      expect(tree).toHaveProperty('/product/app/CalendarGooglePrebuilt');
      expect(tree).toHaveProperty('/product/app/CalendarGooglePrebuilt/oat');
      expect(tree).toHaveProperty('/product/app/CalendarGooglePrebuilt/oat/arm64');
      expect(tree).toHaveProperty('/product/app/Camera2');
      expect(tree).toHaveProperty('/product/app/Camera2/lib');
      expect(tree).toHaveProperty('/product/app/Camera2/lib/arm64');
    });

    it("should correctly identify APK and native library files", () => {
      const androidResult = parse(realWorldOutput, { recursive: true });

      const apkFiles = androidResult.filterEntries((entry: any) => 
        entry.filename.endsWith('.apk')
      );
      expect(apkFiles.length).toBe(2);
      expect(apkFiles.map((f: any) => f.filename)).toContain('CalendarGooglePrebuilt.apk');
      expect(apkFiles.map((f: any) => f.filename)).toContain('Camera2.apk');

      const soFiles = androidResult.filterEntries((entry: any) => 
        entry.filename.endsWith('.so')
      );
      expect(soFiles.length).toBe(2);
      expect(soFiles.map((f: any) => f.filename)).toContain('libjni_jpegutil.so');
      expect(soFiles.map((f: any) => f.filename)).toContain('libjni_tinyplanet.so');

      const odexFiles = androidResult.filterEntries((entry: any) => 
        entry.filename.endsWith('.odex') || entry.filename.endsWith('.vdex')
      );
      expect(odexFiles.length).toBe(2);
    });

    it("should find largest files correctly", () => {
      const androidResult = parse(realWorldOutput, { recursive: true });

      const largestFile = androidResult.findEntry((entry: any) => 
        entry.type === 'file' && typeof entry.size === 'number'
      );
      
      expect(largestFile).toBeDefined();
      
      // Find the actual largest file
      const allFiles = androidResult.filterEntries((entry: any) => 
        entry.type === 'file' && typeof entry.size === 'number'
      );
      const largest = allFiles.reduce((prev: any, current: any) => 
        current.size > prev.size ? current : prev
      );
      
      expect(largest.filename).toBe('CalendarGooglePrebuilt.apk');
      expect(largest.size).toBe(38783606);
      expect(largest.parent).toBe('/product/app/CalendarGooglePrebuilt');
    });

    it("should traverse Android directory structure in correct order", () => {
      const androidResult = parse(realWorldOutput, { recursive: true });

      const visitOrder: string[] = [];
      androidResult.traverse((entry: any, directory: any) => {
        if (entry.type === 'directory') {
          visitOrder.push(`${directory.path}/${entry.filename}`);
        }
      });

      // Verify that parent directories are visited before children
      const calendarIndex = visitOrder.indexOf('/product/app/CalendarGooglePrebuilt');
      const oatIndex = visitOrder.indexOf('/product/app/CalendarGooglePrebuilt/oat');
      
      expect(calendarIndex).toBeGreaterThan(-1);
      expect(oatIndex).toBeGreaterThan(-1);
      expect(calendarIndex).toBeLessThan(oatIndex);
    });

    it("should handle different file size formats", () => {
      const androidResult = parse(realWorldOutput, { recursive: true });

      const largeFiles = androidResult.filterEntries((entry: any) => 
        entry.type === 'file' && entry.size > 1000000
      );

      expect(largeFiles.length).toBeGreaterThan(0);
      largeFiles.forEach((file: any) => {
        expect(typeof file.size).toBe('number');
        expect(file.size).toBeGreaterThan(1000000);
      });
    });
  });
});

describe("Depth parameter comprehensive tests", () => {
  const deepRecursiveOutput = `/root:
total 16
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 level1-a
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 level1-b
-rw-r--r-- 1 root root  100 2009-01-01 00:00 root-file.txt

/root/level1-a:
total 12
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 level2-a
-rw-r--r-- 1 root root   50 2009-01-01 00:00 level1-a-file.txt

/root/level1-a/level2-a:
total 12
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 level3-a
-rw-r--r-- 1 root root   25 2009-01-01 00:00 level2-a-file.txt

/root/level1-a/level2-a/level3-a:
total 8
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 ..
-rw-r--r-- 1 root root   10 2009-01-01 00:00 level3-a-file.txt

/root/level1-b:
total 12
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 3 root root 4096 2009-01-01 00:00 ..
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 level2-b
-rw-r--r-- 1 root root   75 2009-01-01 00:00 level1-b-file.txt

/root/level1-b/level2-b:
total 8
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 .
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 ..
-rw-r--r-- 1 root root   15 2009-01-01 00:00 level2-b-file.txt`;

  describe("depth = 0 (root level only)", () => {
    it("should only include root directory", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 0 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(1);
      expect(paths).toContain('/root');
      expect(paths).not.toContain('/root/level1-a');
      expect(paths).not.toContain('/root/level1-b');
    });

    it("should include root files", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 0 });
      
      const rootEntries = result.getEntriesByPath('/root');
      const filenames = rootEntries!.map(e => e.filename);
      
      expect(filenames).toContain('root-file.txt');
      expect(filenames).toContain('level1-a');
      expect(filenames).toContain('level1-b');
    });
  });

  describe("depth = 1 (root + level1)", () => {
    it("should include root and level1 directories", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(3);
      expect(paths).toContain('/root');
      expect(paths).toContain('/root/level1-a');
      expect(paths).toContain('/root/level1-b');
      
      // Should NOT include level2 directories
      expect(paths).not.toContain('/root/level1-a/level2-a');
      expect(paths).not.toContain('/root/level1-b/level2-b');
    });

    it("should include level1 files", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      
      const level1aEntries = result.getEntriesByPath('/root/level1-a');
      const level1aFilenames = level1aEntries!.map(e => e.filename);
      
      expect(level1aFilenames).toContain('level1-a-file.txt');
      expect(level1aFilenames).toContain('level2-a');
    });
  });

  describe("depth = 2 (root + level1 + level2)", () => {
    it("should include root, level1, and level2 directories", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 2 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(5);
      expect(paths).toContain('/root');
      expect(paths).toContain('/root/level1-a');
      expect(paths).toContain('/root/level1-b');
      expect(paths).toContain('/root/level1-a/level2-a');
      expect(paths).toContain('/root/level1-b/level2-b');
      
      // Should NOT include level3 directories
      expect(paths).not.toContain('/root/level1-a/level2-a/level3-a');
    });

    it("should include level2 files", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 2 });
      
      const level2aEntries = result.getEntriesByPath('/root/level1-a/level2-a');
      const level2aFilenames = level2aEntries!.map(e => e.filename);
      
      expect(level2aFilenames).toContain('level2-a-file.txt');
      expect(level2aFilenames).toContain('level3-a');
    });
  });

  describe("depth = 3 (all levels)", () => {
    it("should include all directories", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 3 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(6);
      expect(paths).toContain('/root');
      expect(paths).toContain('/root/level1-a');
      expect(paths).toContain('/root/level1-b');
      expect(paths).toContain('/root/level1-a/level2-a');
      expect(paths).toContain('/root/level1-b/level2-b');
      expect(paths).toContain('/root/level1-a/level2-a/level3-a');
    });

    it("should include all files at all levels", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 3 });
      
      const allEntries = result.getAllEntries();
      const allFilenames = allEntries.map(e => e.filename);
      
      expect(allFilenames).toContain('root-file.txt');
      expect(allFilenames).toContain('level1-a-file.txt');
      expect(allFilenames).toContain('level1-b-file.txt');
      expect(allFilenames).toContain('level2-a-file.txt');
      expect(allFilenames).toContain('level2-b-file.txt');
      expect(allFilenames).toContain('level3-a-file.txt');
    });
  });

  describe("depth parameter edge cases", () => {
    it("should handle undefined depth (no limit)", () => {
      const result = parse(deepRecursiveOutput, { recursive: true });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(6); // All directories should be included
      
      const allEntries = result.getAllEntries();
      expect(allEntries.length).toBeGreaterThan(10); // All entries should be present
    });

    it("should handle very large depth values", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 999 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(6); // All directories should be included
    });

    it("should handle negative depth values (unlimited)", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: -1 });
      
      const paths = Object.keys(result.getDirectoryTree());
      expect(paths).toHaveLength(6); // All directories should be included, same as no limit
    });

    it("should handle depth 0 with showDotsDir option", () => {
      const result = parse(deepRecursiveOutput, { 
        recursive: true, 
        depth: 0, 
        showDotsDir: true 
      });
      
      const rootEntries = result.getEntriesByPath('/root');
      const filenames = rootEntries!.map(e => e.filename);
      
      expect(filenames).toContain('.');
      expect(filenames).toContain('..');
      expect(filenames).toContain('root-file.txt');
    });
  });

  describe("depth calculation verification", () => {
    it("should calculate depth correctly for different path structures", () => {
      // Test with different path structures to verify depth calculation
      const complexPaths = `/a:
total 4
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 b
-rw-r--r-- 1 root root   10 2009-01-01 00:00 file-a.txt

/a/b:
total 4
drwxr-xr-x 2 root root 4096 2009-01-01 00:00 c
-rw-r--r-- 1 root root   10 2009-01-01 00:00 file-b.txt

/a/b/c:
total 4
-rw-r--r-- 1 root root   10 2009-01-01 00:00 file-c.txt`;

      const depth1Result = parse(complexPaths, { recursive: true, depth: 1 });
      const paths = Object.keys(depth1Result.getDirectoryTree());
      
      // /a is depth 0, /a/b is depth 1, /a/b/c is depth 2
      expect(paths).toContain('/a');      // depth 0
      expect(paths).toContain('/a/b');    // depth 1
      expect(paths).not.toContain('/a/b/c'); // depth 2, exceeds limit
    });

    it("should handle paths starting with /", () => {
      const result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      
      // Verify that paths starting with / are handled correctly
      const allEntries = result.getAllEntries();
      allEntries.forEach(entry => {
        if (entry.parent) {
          expect(entry.parent.startsWith('/')).toBe(true);
        }
      });
    });
  });

  describe("depth with traversal methods", () => {
    it("should respect depth limit in getAllEntries", () => {
      const depth1Result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      const depth2Result = parse(deepRecursiveOutput, { recursive: true, depth: 2 });
      
      const depth1Entries = depth1Result.getAllEntries();
      const depth2Entries = depth2Result.getAllEntries();
      
      expect(depth2Entries.length).toBeGreaterThan(depth1Entries.length);
    });

    it("should respect depth limit in traverse method", () => {
      const depth1Result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      
      let traversedPaths: string[] = [];
      depth1Result.traverse((entry, directory) => {
        traversedPaths.push(directory.path);
      });
      
      // Should only have entries from depth 0 and 1 directories
      const uniquePaths = [...new Set(traversedPaths)];
      expect(uniquePaths).toContain('/root');
      expect(uniquePaths).toContain('/root/level1-a');
      expect(uniquePaths).toContain('/root/level1-b');
      expect(uniquePaths).not.toContain('/root/level1-a/level2-a');
    });

    it("should respect depth limit in filterEntries", () => {
      const depth1Result = parse(deepRecursiveOutput, { recursive: true, depth: 1 });
      
      const txtFiles = depth1Result.filterEntries(entry => 
        entry.filename.endsWith('.txt')
      );
      
      const filePaths = txtFiles.map(f => `${f.parent}/${f.filename}`);
      
      // Should include files from depth 0 and 1, but not deeper
      expect(filePaths).toContain('/root/root-file.txt');
      expect(filePaths).toContain('/root/level1-a/level1-a-file.txt');
      expect(filePaths).toContain('/root/level1-b/level1-b-file.txt');
      expect(filePaths).not.toContain('/root/level1-a/level2-a/level2-a-file.txt');
    });
  });
});

describe("Recursive ls tests (ls -R)", () => {
  const recursiveLsOutput = `/vendor:
total 68
drwxr-xr-x 13 root shell  4096 2009-01-01 00:00 .
drwxr-xr-x 28 root root   4096 2009-01-01 00:00 ..
drwxr-xr-x  2 root shell  4096 2009-01-01 00:00 apex
drwxr-x--x  3 root shell  4096 2009-01-01 00:00 bin
-?????????  ? ?    ?         ?                ? build.prop
drwxr-xr-x 10 root shell  4096 2009-01-01 00:00 etc

/vendor/apex:
total 4108
drwxr-xr-x  2 root shell    4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell    4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root  4227072 2009-01-01 00:00 com.google.android.widevine.nonupdatable.apex

/vendor/bin:
total 320
drwxr-x--x  3 root shell   4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell   4096 2009-01-01 00:00 ..
l?????????  ? ?    ?          ?                ? [ -> ?
l?????????  ? ?    ?          ?                ? acpi -> ?
-?????????  ? ?    ?          ?                ? awk
l?????????  ? ?    ?          ?                ? base64 -> ?
-rw-r--r--  1 root shell 340712 2009-01-01 00:00 sh

ls: lost+found: Permission denied

/vendor/etc:
total 376
drwxr-xr-x 10 root shell   4096 2009-01-01 00:00 .
drwxr-xr-x 13 root shell   4096 2009-01-01 00:00 ..
-rw-r--r--  1 root root  190463 2009-01-01 00:00 NOTICE.xml.gz`;

  it("should parse recursive ls output correctly", () => {
    const result = parse(recursiveLsOutput, { recursive: true });
    console.log(result.getAllEntries());

    expect(result.directories).toHaveLength(4);

    // Test first directory
    const vendorDir = result.directories[0];
    expect(vendorDir?.path).toBe("/vendor");
    expect(vendorDir?.total).toBe(68);
    expect(vendorDir?.entries).toHaveLength(3); // apex, bin, etc (. and .. are hidden by default)

    // Test apex directory
    const apexDir = result.directories[1];
    expect(apexDir?.path).toBe("/vendor/apex");
    expect(apexDir?.total).toBe(4108);
    expect(apexDir?.entries).toHaveLength(1); // Only the apex file (. and .. are hidden by default)

    // Find the apex file
    const apexFile = apexDir?.entries.find(
      (entry) =>
        entry.filename === "com.google.android.widevine.nonupdatable.apex",
    );
    expect(apexFile).toBeDefined();
    expect(apexFile?.type).toBe("file");
    expect(apexFile?.size).toBe(4227072);
    expect(apexFile?.parent).toBe("/vendor/apex");

    // Test bin directory
    const binDir = result.directories[2];
    expect(binDir?.path).toBe("/vendor/bin");
    expect(binDir?.total).toBe(320);
    // Should include only sh (valid entry), . and .. are hidden, entries with unknown permissions are skipped
    expect(binDir?.entries).toHaveLength(1);

    // Find sh file
    const shFile = binDir?.entries.find((entry) => entry.filename === "sh");
    expect(shFile).toBeDefined();
    expect(shFile?.type).toBe("file");
    expect(shFile?.size).toBe(340712);
  });

  it("should handle permission denied errors correctly", () => {
    const result = parse(recursiveLsOutput, { recursive: true });

    // Should have captured the permission error in the bin directory's errors array
    const binDir = result.directories[2]; // /vendor/bin directory
    expect(binDir?.errors).toBeDefined();
    expect(binDir?.errors?.length).toBe(1);
    expect(binDir?.errors?.[0]).toContain("lost+found: Permission denied");
  });

  it("should skip unknown permission entries", () => {
    const result = parse(recursiveLsOutput, { recursive: true });

    const vendorDir = result.directories[0];
    // Should not include build.prop (has unknown permissions -????????? )
    const buildProp = vendorDir?.entries.find(
      (entry) => entry.filename === "build.prop",
    );
    expect(buildProp).toBeUndefined();

    const binDir = result.directories[2];
    // Should not include entries with unknown symlink permissions l?????????
    const unknownSymlinks =
      binDir?.entries?.filter(
        (entry) =>
          entry.filename === "[" ||
          entry.filename === "acpi" ||
          entry.filename === "awk",
      ) || [];
    expect(unknownSymlinks.length).toBe(0);
  });

  it("should handle empty input correctly", () => {
    const result = parse("", { recursive: true });
    expect(result.directories).toHaveLength(0);
    expect(result.errors).toBeUndefined();
  });

  it("should handle single directory without recursion", () => {
    const singleDirOutput = `/home/user:
total 8
drwxr-xr-x 2 user user 4096 2009-01-01 00:00 .
drwxr-xr-x 3 user user 4096 2009-01-01 00:00 ..
-rw-r--r-- 1 user user    0 2009-01-01 00:00 file.txt`;

    const result = parse(singleDirOutput, { recursive: true });
    expect(result.directories).toHaveLength(1);

    const dir = result.directories[0];
    expect(dir?.path).toBe("/home/user");
    expect(dir?.total).toBe(8);
    expect(dir?.entries).toHaveLength(1); // Only file.txt (. and .. are hidden by default)
  });

  it("should include . and .. entries when showDotsDir is true", () => {
    const result = parse(recursiveLsOutput, { recursive: true, showDotsDir: true });

    const vendorDir = result.directories[0];
    expect(vendorDir?.entries).toHaveLength(5); // ., .., apex, bin, etc

    const dotEntry = vendorDir?.entries.find((entry) => entry.filename === ".");
    const dotdotEntry = vendorDir?.entries.find(
      (entry) => entry.filename === "..",
    );

    expect(dotEntry).toBeDefined();
    expect(dotdotEntry).toBeDefined();
  });
});
