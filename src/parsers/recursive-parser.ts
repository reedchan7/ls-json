import {
  LsEntry,
  LsRecursiveDirectory,
  LsRecursiveOutput,
  ParseOptions,
} from "../types";
import { LsUtils } from "../utils";

/**
 * Enhanced LsRecursiveOutput with traversal methods
 */
class LsRecursiveOutputImpl implements LsRecursiveOutput {
  directories: LsRecursiveDirectory[];
  errors?: string[];

  constructor(directories: LsRecursiveDirectory[], errors?: string[]) {
    this.directories = directories;
    if (errors) {
      this.errors = errors;
    }
  }

  getAllEntries(): LsEntry[] {
    const allEntries: LsEntry[] = [];
    for (const dir of this.directories) {
      allEntries.push(...dir.entries);
    }
    return allEntries;
  }

  getEntriesByPath(path: string): LsEntry[] | undefined {
    const dir = this.directories.find((d) => d.path === path);
    return dir?.entries;
  }

  findEntry(predicate: (entry: LsEntry) => boolean): LsEntry | undefined {
    for (const dir of this.directories) {
      const found = dir.entries.find(predicate);
      if (found) return found;
    }
    return undefined;
  }

  filterEntries(predicate: (entry: LsEntry) => boolean): LsEntry[] {
    const filtered: LsEntry[] = [];
    for (const dir of this.directories) {
      filtered.push(...dir.entries.filter(predicate));
    }
    return filtered;
  }

  traverse(
    callback: (entry: LsEntry, directory: LsRecursiveDirectory) => void,
  ): void {
    for (const dir of this.directories) {
      for (const entry of dir.entries) {
        callback(entry, dir);
      }
    }
  }

  getDirectoryTree(): Record<string, LsEntry[]> {
    const tree: Record<string, LsEntry[]> = {};
    for (const dir of this.directories) {
      tree[dir.path] = dir.entries;
    }
    return tree;
  }
}

/**
 * Recursive ls parser for handling ls -R output
 */
export class LsRecursiveParser {
  private static readonly PERMISSION_REGEX =
    /^[-dclpsbDCMnP?]([-r][-w][-xsS]){2}([-r][-w][-xtT])[+]?/;
  private static readonly UNKNOWN_PERMISSIONS_REGEX = /^[dlcpsb-]?\?{9}/;
  private static readonly TOTAL_REGEX = /^total\s+([0-9]+)/;
  private static readonly ERROR_REGEX = /^ls:\s+(.+):\s+(.+)$/;
  private static readonly DIRECTORY_PATH_REGEX = /^(.+):$/;

  /**
   * Parse recursive ls command output
   */
  static parse(data: string, options: ParseOptions = {}): LsRecursiveOutput {
    const { raw = false, showDotsDir = false, depth } = options;

    if (!LsUtils.hasData(data)) {
      return new LsRecursiveOutputImpl([]);
    }

    const directories: LsRecursiveDirectory[] = [];
    const globalErrors: string[] = [];

    const lines = data.split("\n");
    let currentDirectory: LsRecursiveDirectory | null = null;
    let currentDirErrors: string[] = [];
    let currentDepth = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) {
        continue;
      }

      // Skip command prompts
      if (trimmedLine.startsWith("$")) {
        continue;
      }

      // Check for directory path
      const dirMatch = trimmedLine.match(this.DIRECTORY_PATH_REGEX);
      if (dirMatch) {
        // Save previous directory if exists
        if (currentDirectory) {
          if (currentDirErrors.length > 0) {
            currentDirectory.errors = currentDirErrors;
          }
          directories.push(currentDirectory);
        }

        // Check depth limit
        const newPath = dirMatch[1]!;
        // Count the actual directory levels (empty string before first / doesn't count)
        const pathParts = newPath.split("/").filter((part) => part !== "");
        const newDepth = pathParts.length - 1; // depth 0 = root level directory

        if (depth !== undefined && depth >= 0 && newDepth > depth) {
          currentDirectory = null; // Don't process entries for this directory
          continue; // Skip directories beyond the specified depth
        }

        // Start new directory
        currentDirectory = {
          path: newPath,
          entries: [],
        };
        currentDirErrors = [];
        currentDepth = newDepth;
        continue;
      }

      // Check for total line
      const totalMatch = trimmedLine.match(this.TOTAL_REGEX);
      if (totalMatch && currentDirectory) {
        currentDirectory.total = parseInt(totalMatch[1]!, 10);
        continue;
      }

      // Check for error messages
      const errorMatch = trimmedLine.match(this.ERROR_REGEX);
      if (errorMatch) {
        const errorMsg = `${errorMatch[1]}: ${errorMatch[2]}`;
        if (currentDirectory) {
          currentDirErrors.push(errorMsg);
        } else {
          globalErrors.push(errorMsg);
        }
        continue;
      }

      // Skip lines with unknown permissions but don't treat as error
      if (this.UNKNOWN_PERMISSIONS_REGEX.test(trimmedLine)) {
        continue;
      }

      // Try to parse as file entry
      if (this.PERMISSION_REGEX.test(trimmedLine) && currentDirectory) {
        try {
          const entry = this.parseFileEntry(
            trimmedLine,
            currentDirectory.path,
            raw,
          );
          if (
            entry &&
            (showDotsDir || (entry.filename !== "." && entry.filename !== ".."))
          ) {
            currentDirectory.entries.push(entry);
          }
        } catch (error) {
          // If can't parse as file entry, treat as potential error or skip
          currentDirErrors.push(`Failed to parse line: ${trimmedLine}`);
        }
      }
    }

    // Don't forget the last directory
    if (currentDirectory) {
      if (currentDirErrors.length > 0) {
        currentDirectory.errors = currentDirErrors;
      }
      directories.push(currentDirectory);
    }

    return new LsRecursiveOutputImpl(
      directories,
      globalErrors.length > 0 ? globalErrors : undefined,
    );
  }

  /**
   * Parse a single file entry line
   */
  private static parseFileEntry(
    line: string,
    currentPath: string,
    raw: boolean,
  ): LsEntry | null {
    // Parse fields - manually implement Python's maxsplit=8 behavior
    const allParts = line.split(/\s+/);
    const parsedLine: string[] = [];

    // Take first 8 parts directly
    for (let i = 0; i < 8 && i < allParts.length; i++) {
      if (allParts[i] !== undefined) {
        parsedLine.push(allParts[i]!);
      }
    }

    // Join remaining parts as the 9th element (if any)
    if (allParts.length > 8) {
      parsedLine.push(allParts.slice(8).join(" "));
    }

    const outputLine: LsEntry = {
      filename: "",
      flags: parsedLine[0] || "",
      mode: "000",
      type: "file",
      links: parsedLine[1] as any,
      owner: parsedLine[2] || "",
      group: parsedLine[3] || "",
      size: parsedLine[4] as any,
      date: "",
      parent: currentPath,
    };

    // Handle different date formats and determine filename location
    let fullFilename = "";

    if (parsedLine[5] && /^\d{4}-\d{2}-\d{2}$/.test(parsedLine[5])) {
      // ISO date format: parsedLine[5] = date, parsedLine[6] = time, parsedLine[7] = filename
      if (parsedLine[6]) {
        outputLine.date = [parsedLine[5], parsedLine[6]].join(" ");
      }
      // For ISO format, filename starts at parsedLine[7]
      if (parsedLine[7]) {
        fullFilename = parsedLine[7];
        if (parsedLine[8]) {
          fullFilename += " " + parsedLine[8];
        }
      }
    } else if (parsedLine[5] && parsedLine[6] && parsedLine[7]) {
      // Standard format: parsedLine[5] = month, parsedLine[6] = day, parsedLine[7] = time, parsedLine[8] = filename
      outputLine.date = [parsedLine[5], parsedLine[6], parsedLine[7]].join(" ");
      // For standard format, filename is in parsedLine[8]
      if (parsedLine[8]) {
        fullFilename = parsedLine[8];
      }
    }

    if (fullFilename) {
      const filenameField = fullFilename.split(" -> ");
      if (filenameField[0]) {
        outputLine.filename = filenameField[0];
      }
      if (filenameField.length > 1 && filenameField[1]) {
        outputLine.link_to = filenameField[1];
      }
    }

    return raw ? outputLine : LsUtils.processEntries([outputLine])[0] || null;
  }
}
