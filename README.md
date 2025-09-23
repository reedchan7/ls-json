# ls-json

[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg)](https://www.npmjs.com/package/ls-json)

A powerful TypeScript library to parse `ls` and `ls -R` output into structured JSON format with advanced querying capabilities.

## ✨ Features

- **📁 Standard ls parsing** - Parse regular `ls -l` output into structured data
- **🔄 Recursive ls parsing** - Parse `ls -R` output with powerful traversal methods
- **⚡ Streaming support** - Process large ls outputs efficiently
- **🎯 Advanced querying** - Find, filter, and traverse directory structures
- **🔍 Depth control** - Limit recursive parsing depth for performance
- **🛡️ Error handling** - Graceful handling of permission denied and malformed entries

## Installation

```bash
npm install ls-json
```

Or using pnpm:

```bash
pnpm add ls-json
```

## Quick Start

### Basic Usage

### Example 1

```typescript
import { parse } from "ls-json";

const lsOutput = `total 160
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

const result = parse(lsOutput);
console.log(JSON.stringify(result));
```

Output:

```json
[
  {
    "filename": "dist",
    "flags": "drwxr-xr-x",
    "mode": "755",
    "type": "directory",
    "owner": "user",
    "group": "staff",
    "size": 224,
    "date": "Sep 19 14:35",
    "links": 7
  },
  {
    "filename": "index.spec.ts",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 2640,
    "date": "Sep 19 14:51",
    "links": 1
  },
  {
    "filename": "index.ts",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 13201,
    "date": "Sep 19 15:10",
    "links": 1
  },
  {
    "filename": "LICENSE",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 11358,
    "date": "Sep 19 14:40",
    "links": 1
  },
  {
    "filename": "node_modules",
    "flags": "drwxr-xr-x",
    "mode": "755",
    "type": "directory",
    "owner": "user",
    "group": "staff",
    "size": 384,
    "date": "Sep 19 14:51",
    "links": 12
  },
  {
    "filename": "package.json",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 1164,
    "date": "Sep 19 14:51",
    "links": 1
  },
  {
    "filename": "pnpm-lock.yaml",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 31149,
    "date": "Sep 19 14:51",
    "links": 1
  },
  {
    "filename": "README.md",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 1072,
    "date": "Sep 19 14:40",
    "links": 1
  },
  {
    "filename": "tsconfig.json",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 909,
    "date": "Sep 19 14:51",
    "links": 1
  },
  {
    "filename": "vitest.config.ts",
    "flags": "-rw-r--r--",
    "mode": "644",
    "type": "file",
    "owner": "user",
    "group": "staff",
    "size": 366,
    "date": "Sep 19 14:52",
    "links": 1
  }
]
```

### Example 2

```typescript
import { parse } from "ls-json";

const lsOutput = `total 16
-rw-r--r-- 1 user user 1024 Sep 19 14:51 package.json
drwxr-xr-x 2 user user 4096 Sep 19 14:52 src`;

const result = parse(lsOutput);
console.log(result[0].filename); // "package.json"
console.log(result[0].type); // "file"
console.log(result[0].size); // 1024
```

### Recursive Directory Parsing

```typescript
import { parse } from "ls-json";

const recursiveOutput = `./src:
total 12
-rw-r--r-- 1 user user 256 Sep 19 14:51 index.ts
drwxr-xr-x 2 user user 4096 Sep 19 14:52 utils

./src/utils:
total 8
-rw-r--r-- 1 user user 128 Sep 19 14:53 helper.ts`;

const result = parse(recursiveOutput, { recursive: true });

// Get all files across all directories
const allFiles = result.getAllEntries();
console.log(allFiles.length); // 3 entries

// Find specific files
const indexFile = result.findEntry((entry) => entry.filename === "index.ts");
console.log(indexFile?.parent); // "./src"

// Filter by file type
const jsFiles = result.filterEntries(
  (entry) => entry.filename.endsWith(".ts") && entry.type === "file"
);
console.log(jsFiles.length); // 2 TypeScript files
```

## API Reference

### Core Functions

#### `parse(data: string, options?: ParseOptions)`

The main parsing function that handles both standard and recursive ls output.

**Parameters:**

- `data` - The ls command output string
- `options` - Optional configuration object

**Returns:**

- `LsEntry[]` for standard parsing
- `LsRecursiveOutput` for recursive parsing (when `options.recursive = true`)

#### `parseStreaming(lines: Iterable<string>, options?: ParseOptions)`

Process ls output line by line using a generator for memory efficiency.

### Parse Options

```typescript
interface ParseOptions {
  // Parse as recursive ls output (ls -R)
  recursive?: boolean;

  // Maximum directory depth (0 = root only, undefined = no limit)
  depth?: number;

  // Include . and .. entries (default: false)
  showDotsDir?: boolean;

  // Return raw data without processing (default: false)
  raw?: boolean;

  // Continue on errors (default: false)
  ignoreExceptions?: boolean;
}
```

### Recursive Output Methods

When using `recursive: true`, the result object provides powerful traversal methods:

```typescript
// Get all entries from all directories
const allEntries = result.getAllEntries();

// Find first entry matching criteria
const configFile = result.findEntry(
  (entry) => entry.filename === "config.json"
);

// Get all entries matching criteria
const largeFiles = result.filterEntries((entry) => entry.size > 1000000);

// Get entries from specific directory
const homeEntries = result.getEntriesByPath("/home/user");

// Get directory tree structure
const tree = result.getDirectoryTree(); // { '/path': [entries...] }

// Process all entries with callback
result.traverse((entry, directory) => {
  console.log(`${directory.path}/${entry.filename}`);
});
```

## Advanced Examples

### Depth-Limited Parsing

```typescript
// Only parse root level + 1 level deep
const result = parse(recursiveOutput, {
  recursive: true,
  depth: 1,
});

// Process shallow structure for better performance
const topLevelDirs = result.filterEntries(
  (entry) => entry.type === "directory"
);
```

### File Analysis

```typescript
const result = parse(lsRecursiveOutput, { recursive: true });

// Find the largest file
const largestFile = result
  .getAllEntries()
  .filter((entry) => entry.type === "file" && typeof entry.size === "number")
  .reduce((largest, current) =>
    current.size > largest.size ? current : largest
  );

// Count files by extension
const extensionCounts = {};
result.traverse((entry) => {
  if (entry.type === "file") {
    const ext = entry.filename.split(".").pop() || "no-extension";
    extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;
  }
});

// Find executable files
const executables = result.filterEntries(
  (entry) => entry.flags && entry.flags.includes("x") && entry.type === "file"
);
```

### Error Handling

```typescript
const result = parse(lsOutput, {
  recursive: true,
  ignoreExceptions: true,
});

// Check for parsing errors
if (result.errors) {
  console.log("Global errors:", result.errors);
}

// Check directory-specific errors
result.directories.forEach((dir) => {
  if (dir.errors) {
    console.log(`Errors in ${dir.path}:`, dir.errors);
  }
});
```

## Data Structures

### LsEntry

```typescript
interface LsEntry {
  filename: string; // File or directory name
  flags: string; // Permission string (e.g., "-rwxr-xr-x")
  mode: string; // Octal permissions (e.g., "755")
  type:
    | "file"
    | "directory"
    | "symlink"
    | "block"
    | "character"
    | "pipe"
    | "socket";
  owner: string; // Owner username
  group: string; // Group name
  size: number | string; // Size in bytes or human-readable
  date: string; // Modification date
  links?: number; // Hard link count
  parent?: string; // Parent directory (recursive mode only)
  link_to?: string; // Symlink target
  epoch?: number; // Unix timestamp (when available)
}
```

## Performance Tips

- Use `depth` parameter to limit recursive parsing depth
- Use `parseStreaming` for very large outputs
- Set `ignoreExceptions: true` for malformed input
- Use specific query methods instead of `getAllEntries()` when possible

## License

[Apache-2.0](./LICENSE)
