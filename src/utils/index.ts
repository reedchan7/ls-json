import { LsEntry } from "../types";

/**
 * Utility functions for parsing
 */
export class LsUtils {
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
   * Convert permission string to octal mode string (e.g., "rwxr-xr-x" -> "755")
   * Returns 3-digit octal string with leading zeros preserved (e.g., "022", "077")
   */
  static permissionToMode(permission: string): string | undefined {
    if (!permission || permission.length < 9) {
      return undefined;
    }

    // Extract permission part (skip first char which is file type)
    const permStr = permission.slice(1, 10);
    let mode = "";

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

      mode += groupValue.toString();
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

  /**
   * Process raw data to conform to schema
   */
  static processEntries(procData: LsEntry[]): LsEntry[] {
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
}
