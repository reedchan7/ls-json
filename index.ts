export interface LsEntry {
  filename: string;
  flags?: string;
  mode?: number;
  type?:
    | "file"
    | "directory"
    | "symlink"
    | "block"
    | "character"
    | "pipe"
    | "socket";
  links?: number;
  parent?: string;
  owner?: string;
  group?: string;
  size?: number | string;
  date?: string;
  epoch?: number;
  epoch_utc?: number;
  link_to?: string;
}

export interface LsStreamEntry extends LsEntry {
  size?: number | string;
  _jc_meta?: {
    success: boolean;
    error?: string;
    line?: string;
  };
}

interface ParseOptions {
  raw?: boolean;
  quiet?: boolean;
  ignoreExceptions?: boolean;
}

/**
 * Utility functions for parsing
 */
class LsUtils {
  /**
   * Convert string to integer, return undefined if not a valid number
   * Keep human-readable sizes (with units like B, K, M, G) as strings
   */
  static convertToInt(value: string): number | string | undefined {
    // If value contains human-readable units, keep as string
    if (/[BKMGT]$/i.test(value.trim())) {
      return value;
    }

    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  }

  /**
   * Parse date string to timestamp (naive implementation)
   * Only handles basic date formats for now
   */
  static timestamp(dateStr: string): { naive?: number; utc?: number } {
    try {
      // Try to parse the date string
      // This is a simplified implementation
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return {};
      }

      return {
        naive: Math.floor(date.getTime() / 1000),
        utc: Math.floor(date.getTime() / 1000),
      };
    } catch {
      return {};
    }
  }

  /**
   * Convert permission string to octal mode (e.g., "rwxr-xr-x" -> 755)
   */
  static permissionToMode(permission: string): number | undefined {
    if (!permission || permission.length < 9) {
      return undefined;
    }

    // Extract permission part (skip first char which is file type)
    const permStr = permission.slice(1, 10);
    let mode = 0;

    // Process in groups of 3: owner, group, other
    for (let i = 0; i < 9; i += 3) {
      const groupValue =
        (permStr[i] === "r" ? 4 : 0) + // read
        (permStr[i + 1] === "w" ? 2 : 0) + // write
        (permStr[i + 2] === "x" ||
        permStr[i + 2] === "s" ||
        permStr[i + 2] === "t"
          ? 1
          : 0); // execute

      mode = mode * 10 + groupValue;
    }

    return mode;
  }

  /**
   * Extract file type from permission flags (first character)
   */
  static getFileType(
    flags: string,
  ):
    | "file"
    | "directory"
    | "symlink"
    | "block"
    | "character"
    | "pipe"
    | "socket"
    | undefined {
    if (!flags || flags.length === 0) {
      return undefined;
    }

    const typeChar = flags.charAt(0);
    switch (typeChar) {
      case "d":
        return "directory";
      case "l":
        return "symlink";
      case "b":
        return "block";
      case "c":
        return "character";
      case "p":
        return "pipe";
      case "s":
        return "socket";
      case "-":
      default:
        return "file";
    }
  }

  /**
   * Check if data has content
   */
  static hasData(data: string): boolean {
    return data.trim().length > 0;
  }
}

/**
 * Main ls parser class
 */
export class LsParser {
  private static readonly PERMISSION_REGEX =
    /^[-dclpsbDCMnP?]([-r][-w][-xsS]){2}([-r][-w][-xtT])[+]?/;
  private static readonly UNKNOWN_PERMISSIONS_REGEX = /^[dlcpsb-]?\?{9}/;
  private static readonly TOTAL_REGEX = /^total [0-9]+/;
  private static readonly DEFAULT_DATE_REGEX =
    /^[a-zA-Z]{3}\s{1,2}\d{1,2}\s{1,2}[0-9:]{4,5}$/;

  /**
   * Process raw data to conform to schema
   */
  private static _process(procData: LsEntry[]): LsEntry[] {
    const intList = ["links", "size"] as const;

    for (const entry of procData) {
      // Convert numeric fields
      for (const key of intList) {
        if (key in entry && typeof entry[key] === "string") {
          const converted = LsUtils.convertToInt(entry[key] as string);
          if (converted !== undefined) {
            entry[key] = converted as any;
          }
        }
      }

      // Convert permission flags to octal mode and extract file type
      if (entry.flags) {
        const mode = LsUtils.permissionToMode(entry.flags);
        if (mode !== undefined) {
          entry.mode = mode;
        }

        const fileType = LsUtils.getFileType(entry.flags);
        if (fileType !== undefined) {
          entry.type = fileType;
        }
      }

      // Process date field - don't add epoch fields by default to match jc behavior
      // Only add them for non-standard date formats (like --time-style=full-iso)
      if (entry.date) {
        // Only add epoch for full-iso style dates (YYYY-MM-DD HH:MM:SS format with timezone)
        if (
          entry.date.includes("T") ||
          entry.date.includes("+") ||
          (entry.date.includes("-") && entry.date.length > 16)
        ) {
          const ts = LsUtils.timestamp(entry.date);
          if (ts.naive !== undefined) {
            entry.epoch = ts.naive;
          }
          if (ts.utc !== undefined) {
            entry.epoch_utc = ts.utc;
          }
        }
      }
    }

    return procData;
  }

  /**
   * Parse ls command output
   */
  static parse(data: string, options: ParseOptions = {}): LsEntry[] {
    const { raw = false } = options;

    if (!LsUtils.hasData(data)) {
      return [];
    }

    const rawOutput: LsEntry[] = [];
    let parent = "";
    let nextIsParent = false;
    let newSection = false;

    const linedata = data.split("\n");

    // Remove command line prompts (lines starting with $)
    while (
      linedata.length > 0 &&
      linedata[0] &&
      (linedata[0].startsWith("$") || linedata[0].trim().startsWith("$"))
    ) {
      linedata.shift();
    }

    // Delete first line if it starts with 'total 1234'
    if (
      linedata.length > 0 &&
      linedata[0] &&
      this.TOTAL_REGEX.test(linedata[0])
    ) {
      linedata.shift();
    }

    // Look for parent line if glob or -R is used
    if (
      linedata.length > 0 &&
      linedata[0] &&
      !this.PERMISSION_REGEX.test(linedata[0]) &&
      linedata[0].endsWith(":")
    ) {
      parent = linedata.shift()!.slice(0, -1);
      // Pop following total line if it exists
      if (
        linedata.length > 0 &&
        linedata[0] &&
        this.TOTAL_REGEX.test(linedata[0])
      ) {
        linedata.shift();
      }
    }

    // Check if -l was used to parse extra data
    // Look for the first line that matches permission format to determine if this is detailed format
    const hasDetailedFormat = linedata.some(
      (line) => line && this.PERMISSION_REGEX.test(line),
    );

    if (hasDetailedFormat) {
      for (const entry of linedata) {
        const outputLine: LsEntry = { filename: "" };

        if (!this.PERMISSION_REGEX.test(entry) && entry.endsWith(":")) {
          parent = entry.slice(0, -1);
          newSection = true;

          // Fixup to remove trailing \n in previous entry
          if (rawOutput.length > 0) {
            const lastEntry = rawOutput[rawOutput.length - 1];
            if (lastEntry) {
              lastEntry.filename = lastEntry.filename.replace(/\n$/, "");
            }
          }
          continue;
        }

        if (this.TOTAL_REGEX.test(entry)) {
          newSection = false;
          continue;
        }

        // Fix for OSX - doesn't print 'total xx' line if empty directory
        if (newSection && entry === "") {
          newSection = false;
          continue;
        }

        // Skip lines with unknown permissions (lines with question marks)
        if (this.UNKNOWN_PERMISSIONS_REGEX.test(entry)) {
          continue;
        }

        // Fixup for filenames with newlines
        if (!newSection && !this.PERMISSION_REGEX.test(entry)) {
          if (rawOutput.length > 0) {
            const lastEntry = rawOutput[rawOutput.length - 1];
            if (lastEntry) {
              lastEntry.filename = lastEntry.filename + "\n" + entry;
            }
          }
          continue;
        }

        // Parse fields - manually implement Python's maxsplit=8 behavior
        const allParts = entry.split(/\s+/);
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

        if (parsedLine[0]) outputLine.flags = parsedLine[0];
        if (parsedLine[1]) outputLine.links = parsedLine[1] as any;
        if (parsedLine[2]) outputLine.owner = parsedLine[2];
        if (parsedLine[3]) outputLine.group = parsedLine[3];
        if (parsedLine[4]) outputLine.size = parsedLine[4] as any;

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
          outputLine.date = [parsedLine[5], parsedLine[6], parsedLine[7]].join(
            " ",
          );
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

        if (parent) {
          outputLine.parent = parent;
        }

        rawOutput.push(outputLine);
      }
    } else {
      // Simple format without -l
      for (const entry of linedata) {
        const outputLine: LsEntry = { filename: "" };

        if (entry === "") {
          nextIsParent = true;
          continue;
        }

        if (nextIsParent && entry.endsWith(":")) {
          parent = entry.slice(0, -1);
          nextIsParent = false;
          continue;
        }

        outputLine.filename = entry;

        if (parent) {
          outputLine.parent = parent;
        }

        rawOutput.push(outputLine);
      }
    }

    return raw ? rawOutput : this._process(rawOutput);
  }
}

/**
 * Streaming ls parser
 */
export class LsStreamingParser {
  private static readonly PERMISSION_REGEX =
    /^[-dclpsbDCMnP?]([-r][-w][-xsS]){2}([-r][-w][-xtT])[+]?/;
  private static readonly UNKNOWN_PERMISSIONS_REGEX = /^[dlcpsb-]?\?{9}/;
  private static readonly TOTAL_REGEX = /^total [0-9]+/;
  private static readonly DEFAULT_DATE_REGEX =
    /^[a-zA-Z]{3}\s{1,2}\d{1,2}\s{1,2}[0-9:]{4,5}$/;

  /**
   * Process single entry to conform to schema
   */
  private static _processEntry(procData: LsStreamEntry): LsStreamEntry {
    const intList = ["links", "size"] as const;

    for (const key of intList) {
      if (key in procData && typeof procData[key] === "string") {
        const converted = LsUtils.convertToInt(procData[key] as string);
        if (converted !== undefined) {
          procData[key] = converted as any;
        }
      }
    }

    // Convert permission flags to octal mode and extract file type
    if (procData.flags) {
      const mode = LsUtils.permissionToMode(procData.flags);
      if (mode !== undefined) {
        procData.mode = mode;
      }

      const fileType = LsUtils.getFileType(procData.flags);
      if (fileType !== undefined) {
        procData.type = fileType;
      }
    }

    if (procData.date) {
      // Only add epoch for full-iso style dates (YYYY-MM-DD HH:MM:SS format with timezone)
      if (
        procData.date.includes("T") ||
        procData.date.includes("+") ||
        (procData.date.includes("-") && procData.date.length > 16)
      ) {
        const ts = LsUtils.timestamp(procData.date);
        if (ts.naive !== undefined) {
          procData.epoch = ts.naive;
        }
        if (ts.utc !== undefined) {
          procData.epoch_utc = ts.utc;
        }
      }
    }

    return procData;
  }

  /**
   * Parse ls command output as generator (streaming)
   */
  static *parse(
    lines: Iterable<string>,
    options: ParseOptions = {},
  ): Generator<LsStreamEntry, void, unknown> {
    const { raw = false, ignoreExceptions = false } = options;
    let parent = "";

    for (const line of lines) {
      try {
        // Skip line if it starts with 'total 1234'
        if (this.TOTAL_REGEX.test(line)) {
          continue;
        }

        // Skip blank lines
        if (!line.trim()) {
          continue;
        }

        // Look for parent line if glob or -R is used
        if (!this.PERMISSION_REGEX.test(line) && line.trim().endsWith(":")) {
          parent = line.trim().slice(0, -1);
          continue;
        }

        // Skip command line prompts (lines starting with $)
        if (line.startsWith("$") || line.trim().startsWith("$")) {
          continue;
        }

        // Skip lines with unknown permissions (lines with question marks)
        if (this.UNKNOWN_PERMISSIONS_REGEX.test(line)) {
          continue;
        }

        if (!this.PERMISSION_REGEX.test(line)) {
          throw new Error("Not ls -l data");
        }

        // Parse fields - manually implement Python's maxsplit=8 behavior
        const allParts = line.trim().split(/\s+/);
        const parsedLine: string[] = [];
        const outputLine: LsStreamEntry = { filename: "" };

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

        if (parsedLine[0]) outputLine.flags = parsedLine[0];
        if (parsedLine[1]) outputLine.links = parsedLine[1] as any;
        if (parsedLine[2]) outputLine.owner = parsedLine[2];
        if (parsedLine[3]) outputLine.group = parsedLine[3];
        if (parsedLine[4]) outputLine.size = parsedLine[4] as any;

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
          outputLine.date = [parsedLine[5], parsedLine[6], parsedLine[7]].join(
            " ",
          );
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

        if (parent) {
          outputLine.parent = parent;
        }

        yield raw ? outputLine : this._processEntry(outputLine);
      } catch (error) {
        if (ignoreExceptions) {
          const errorEntry: LsStreamEntry = {
            filename: "",
            _jc_meta: {
              success: false,
              error: error instanceof Error ? error.message : String(error),
              line: line,
            },
          };
          yield errorEntry;
        } else {
          throw error;
        }
      }
    }
  }
}

// Default export and convenience functions
export default {
  parse: LsParser.parse,
  parseStreaming: LsStreamingParser.parse,
  LsParser,
  LsStreamingParser,
};

/**
 * Convenience function to parse ls output
 */
export function parse(data: string, options?: ParseOptions): LsEntry[] {
  return LsParser.parse(data, options);
}

/**
 * Convenience function to parse ls output as stream
 */
export function parseStreaming(
  lines: Iterable<string>,
  options?: ParseOptions,
): Generator<LsStreamEntry, void, unknown> {
  return LsStreamingParser.parse(lines, options);
}
