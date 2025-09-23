/**
 * Represents a single file or directory entry from ls output.
 *
 * This is the core data structure containing all parsed information
 * about a file, directory, or other file system object.
 */
export interface LsEntry {
  /** The name of the file or directory */
  filename: string;

  /** The permission flags string (e.g., "-rwxr-xr-x", "drwxr-xr-x") */
  flags: string;

  /** The octal permission mode (e.g., "755", "644") */
  mode: string;

  /** The type of file system object */
  type:
    | "file" // Regular file
    | "directory" // Directory
    | "symlink" // Symbolic link
    | "block" // Block device
    | "character" // Character device
    | "pipe" // Named pipe (FIFO)
    | "socket"; // Socket

  /** Number of hard links (may be undefined for some formats) */
  links?: number;

  /** Parent directory path (only present in recursive parsing) */
  parent?: string;

  /** Owner username */
  owner: string;

  /** Group name */
  group: string;

  /** File size in bytes (number) or human-readable format (string) */
  size: number | string;

  /** Modification date/time string as shown in ls output */
  date: string;

  /** Modification timestamp as Unix epoch (when available) */
  epoch?: number;

  /** Modification timestamp as Unix epoch UTC (when available) */
  epoch_utc?: number;

  /** Target path for symbolic links */
  link_to?: string;
}

/**
 * Extended LsEntry for streaming parse results.
 *
 * Used by the parseStreaming function to provide additional metadata
 * about the parsing process for each entry.
 */
export interface LsStreamEntry extends LsEntry {
  /** File size (same as LsEntry but explicitly typed) */
  size: number | string;

  /** Metadata about the parsing process (when available) */
  _jc_meta?: {
    /** Whether the line was successfully parsed */
    success: boolean;
    /** Error message if parsing failed */
    error?: string;
    /** The original line that was parsed */
    line?: string;
  };
}

/**
 * Represents a single directory in a recursive ls structure.
 *
 * This contains all the entries found in one directory, along with
 * metadata about the directory itself.
 */
export interface LsRecursiveDirectory {
  /** The full path of the directory */
  path: string;

  /** Total size/block count from ls output (when shown) */
  total?: number;

  /** Array of all entries (files and subdirectories) in this directory */
  entries: LsEntry[];

  /** Directory-specific errors (e.g., permission denied for subdirectories) */
  errors?: string[];
}

/**
 * Result object for recursive ls parsing with powerful traversal methods.
 *
 * This interface provides a comprehensive set of methods for working with
 * recursive directory structures parsed from `ls -R` output.
 */
export interface LsRecursiveOutput {
  /** Array of all directories found in the recursive listing */
  directories: LsRecursiveDirectory[];

  /** Global errors that occurred during parsing (e.g., permission denied) */
  errors?: string[];

  /**
   * Get all entries from all directories in a single flat array.
   *
   * This method is useful when you want to work with all files and directories
   * across all parsed directories without caring about their hierarchical structure.
   *
   * @returns Array of all LsEntry objects from all directories
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   * const allFiles = result.getAllEntries();
   * console.log(`Total entries: ${allFiles.length}`);
   * ```
   */
  getAllEntries(): LsEntry[];

  /**
   * Get all entries from a specific directory path.
   *
   * Returns the entries for a specific directory path. Useful when you know
   * the exact path and want to examine its contents.
   *
   * @param path - The directory path to get entries for
   * @returns Array of entries for the specified path, or undefined if path doesn't exist
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   * const homeEntries = result.getEntriesByPath('/home/user');
   * if (homeEntries) {
   *   console.log(`Files in /home/user: ${homeEntries.length}`);
   * }
   * ```
   */
  getEntriesByPath(path: string): LsEntry[] | undefined;

  /**
   * Find the first entry that matches the given predicate function.
   *
   * This method searches across all directories and returns the first entry
   * that matches your criteria. Perfect for finding specific files or directories
   * when you don't know their exact location.
   *
   * @param predicate - Function that tests each entry and returns true for matches
   * @returns The first matching entry, or undefined if no match is found
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   *
   * // Find a specific file
   * const configFile = result.findEntry(entry => entry.filename === 'config.json');
   *
   * // Find the largest file
   * const largestFile = result.findEntry(entry =>
   *   entry.type === 'file' && typeof entry.size === 'number' && entry.size > 1000000
   * );
   *
   * // Find executable files
   * const executable = result.findEntry(entry =>
   *   entry.flags && entry.flags.includes('x')
   * );
   * ```
   */
  findEntry(predicate: (entry: LsEntry) => boolean): LsEntry | undefined;

  /**
   * Filter and return all entries that match the given predicate function.
   *
   * This method searches across all directories and returns all entries
   * that match your criteria. Great for collecting specific types of files
   * or directories based on complex conditions.
   *
   * @param predicate - Function that tests each entry and returns true for matches
   * @returns Array of all matching entries
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   *
   * // Get all JavaScript files
   * const jsFiles = result.filterEntries(entry =>
   *   entry.filename.endsWith('.js') && entry.type === 'file'
   * );
   *
   * // Get all directories
   * const directories = result.filterEntries(entry => entry.type === 'directory');
   *
   * // Get large files (> 1MB)
   * const largeFiles = result.filterEntries(entry =>
   *   entry.type === 'file' && typeof entry.size === 'number' && entry.size > 1048576
   * );
   *
   * // Get files by owner
   * const userFiles = result.filterEntries(entry => entry.owner === 'john');
   * ```
   */
  filterEntries(predicate: (entry: LsEntry) => boolean): LsEntry[];

  /**
   * Traverse all entries across all directories with a callback function.
   *
   * This method calls your callback function for every entry in every directory,
   * providing both the entry and its containing directory context. Perfect for
   * processing all files systematically or building custom data structures.
   *
   * @param callback - Function called for each entry with (entry, directory) parameters
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   *
   * // Count files by type
   * const typeCounts = {};
   * result.traverse((entry, directory) => {
   *   typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;
   * });
   *
   * // Build a size report
   * let totalSize = 0;
   * result.traverse((entry, directory) => {
   *   if (entry.type === 'file' && typeof entry.size === 'number') {
   *     totalSize += entry.size;
   *     console.log(`${directory.path}/${entry.filename}: ${entry.size} bytes`);
   *   }
   * });
   *
   * // Find and process configuration files
   * result.traverse((entry, directory) => {
   *   if (entry.filename.includes('config') && entry.type === 'file') {
   *     console.log(`Config file found: ${directory.path}/${entry.filename}`);
   *   }
   * });
   * ```
   */
  traverse(
    callback: (entry: LsEntry, directory: LsRecursiveDirectory) => void,
  ): void;

  /**
   * Get a tree-like structure mapping directory paths to their entries.
   *
   * Returns an object where keys are directory paths and values are arrays
   * of entries in those directories. This provides a convenient way to
   * access directory contents by path and understand the overall structure.
   *
   * @returns Object mapping directory paths to their entry arrays
   *
   * @example
   * ```typescript
   * const result = parse(lsRecursiveOutput, { recursive: true });
   * const tree = result.getDirectoryTree();
   *
   * // List all directory paths
   * console.log('Directory structure:');
   * Object.keys(tree).forEach(path => {
   *   console.log(`${path} (${tree[path].length} entries)`);
   * });
   *
   * // Check if a directory exists
   * if (tree['/home/user']) {
   *   console.log('User directory exists');
   * }
   *
   * // Process each directory
   * Object.entries(tree).forEach(([path, entries]) => {
   *   console.log(`Processing ${path}:`);
   *   entries.forEach(entry => {
   *     console.log(`  - ${entry.filename} (${entry.type})`);
   *   });
   * });
   * ```
   */
  getDirectoryTree(): Record<string, LsEntry[]>;
}

/**
 * Configuration options for parsing ls output.
 *
 * These options control how the ls output is parsed and what data is included
 * in the results. All options are optional and have sensible defaults.
 */
export interface ParseOptions {
  /**
   * Return raw data without additional processing.
   *
   * When true, disables post-processing like permission mode conversion
   * and keeps data closer to the original ls output format.
   *
   * @default false
   */
  raw?: boolean;

  /**
   * Continue parsing even when encountering errors.
   *
   * When true, parsing continues when malformed lines or unexpected
   * data is encountered, rather than throwing exceptions.
   *
   * @default false
   */
  ignoreExceptions?: boolean;

  /**
   * Include . and .. directory entries in results.
   *
   * By default, . (current directory) and .. (parent directory) entries
   * are filtered out since they're rarely useful in parsed output.
   * Set to true to include them.
   *
   * @default false
   */
  showDotsDir?: boolean;

  /**
   * Parse as recursive ls output (ls -R).
   *
   * When true, parses the input as recursive ls output with multiple
   * directories and returns an LsRecursiveOutput object instead of
   * a simple array. This enables powerful traversal and search methods.
   *
   * @default false
   */
  recursive?: boolean;

  /**
   * Maximum path depth for entries in recursive parsing results.
   *
   * Only applies when recursive is true. Controls which entries are included
   * in the final results based on their full path depth:
   *
   * - `0`: Only entries with path depth 0 (practically none, since min depth is 1)
   * - `1`: Only entries like `/root/file.txt` (path depth 1)
   * - `2`: Only entries like `/root/dir/file.txt` (path depth 2) and shallower
   * - `3`: Entries with path depth ≤ 3, etc.
   * - `undefined` or negative values: No depth limit (include all entries)
   *
   * This filters individual file/directory entries based on their complete path depth,
   * allowing precise control over which parts of the directory tree are returned.
   * Useful for performance and focusing on specific directory levels.
   *
   * @default undefined (no limit)
   */
  depth?: number;
}

export type ParseResult<T extends ParseOptions> = T["recursive"] extends true
  ? LsRecursiveOutput
  : LsEntry[];
