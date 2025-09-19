# ls-json

parse ls output to json format.


## Installation

```bash
npm install ls-json
```

Or using pnpm:
```bash
pnpm add ls-json
```

## Usage

### Basic Usage

```typescript
import { parse } from 'ls-json';

// Parse ls output
const lsOutput = `total 160
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

const result = parse(lsOutput);
console.log(JSON.stringify(result, null, 2));
```

Output:

```json
[
  {
    "filename": ".",
    "flags": "drwxr-xr-x",
    "links": 12,
    "owner": "reedchan",
    "group": "staff",
    "size": 384,
    "date": "Sep 19 14:51",
    "mode": 755,
    "type": "directory"
  },
  {
    "filename": "..",
    "flags": "drwxr-xr-x",
    "links": 9,
    "owner": "reedchan",
    "group": "staff",
    "size": 288,
    "date": "Sep 19 14:16",
    "mode": 755,
    "type": "directory"
  },
  {
    "filename": "dist",
    "flags": "drwxr-xr-x",
    "links": 7,
    "owner": "reedchan",
    "group": "staff",
    "size": 224,
    "date": "Sep 19 14:35",
    "mode": 755,
    "type": "directory"
  },
  {
    "filename": "index.spec.ts",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 2640,
    "date": "Sep 19 14:51",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "index.ts",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 13201,
    "date": "Sep 19 15:10",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "LICENSE",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 11358,
    "date": "Sep 19 14:40",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "node_modules",
    "flags": "drwxr-xr-x",
    "links": 12,
    "owner": "reedchan",
    "group": "staff",
    "size": 384,
    "date": "Sep 19 14:51",
    "mode": 755,
    "type": "directory"
  },
  {
    "filename": "package.json",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 1164,
    "date": "Sep 19 14:51",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "pnpm-lock.yaml",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 31149,
    "date": "Sep 19 14:51",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "README.md",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 1072,
    "date": "Sep 19 14:40",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "tsconfig.json",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 909,
    "date": "Sep 19 14:51",
    "mode": 644,
    "type": "file"
  },
  {
    "filename": "vitest.config.ts",
    "flags": "-rw-r--r--",
    "links": 1,
    "owner": "reedchan",
    "group": "staff",
    "size": 366,
    "date": "Sep 19 14:52",
    "mode": 644,
    "type": "file"
  }
]
```


## License

[Apache-2.0](./LICENSE)
