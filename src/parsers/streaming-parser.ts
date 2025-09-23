import { LsStreamEntry, ParseOptions } from "../types";
import { LsUtils } from "../utils";

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
    const {
      raw = false,
      ignoreExceptions = false,
      showDotsDir = false,
    } = options;
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
        const outputLine: LsStreamEntry = {
          filename: "",
          flags: "",
          mode: "000",
          type: "file",
          owner: "",
          group: "",
          size: 0,
          date: "",
        };

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

        // Skip . and .. entries if showDotsDir is disabled
        if (
          !showDotsDir &&
          (outputLine.filename === "." || outputLine.filename === "..")
        ) {
          continue;
        }

        yield raw ? outputLine : this._processEntry(outputLine);
      } catch (error) {
        if (ignoreExceptions) {
          const errorEntry: LsStreamEntry = {
            filename: "",
            flags: "",
            mode: "000",
            type: "file",
            owner: "",
            group: "",
            size: 0,
            date: "",
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
