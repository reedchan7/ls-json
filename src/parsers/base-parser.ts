import { LsEntry, ParseOptions } from "../types";
import { LsUtils } from "../utils";

/**
 * Main ls parser class for standard ls output
 */
export class LsParser {
  private static readonly PERMISSION_REGEX =
    /^[-dclpsbDCMnP?]([-r][-w][-xsS]){2}([-r][-w][-xtT])[+]?/;
  private static readonly UNKNOWN_PERMISSIONS_REGEX = /^[dlcpsb-]?\?{9}/;
  private static readonly TOTAL_REGEX = /^total [0-9]+/;
  private static readonly DEFAULT_DATE_REGEX =
    /^[a-zA-Z]{3}\s{1,2}\d{1,2}\s{1,2}[0-9:]{4,5}$/;
  private static readonly ERROR_REGEX = /^ls:\s+(.+):\s+(.+)$/;
  private static readonly DIRECTORY_PATH_REGEX = /^(.+):$/;

  /**
   * Parse ls command output
   */
  static parse(data: string, options: ParseOptions = {}): LsEntry[] {
    const { raw = false, showDotsDir = false } = options;

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
        const outputLine: LsEntry = {
          filename: "",
          flags: "",
          mode: "000",
          type: "file",
          owner: "",
          group: "",
          size: 0,
          date: "",
        };

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
        const outputLine: LsEntry = {
          filename: "",
          flags: "",
          mode: "000",
          type: "file",
          owner: "",
          group: "",
          size: 0,
          date: "",
        };

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

    let result = raw ? rawOutput : LsUtils.processEntries(rawOutput);

    // Filter out . and .. entries if showDotsDir is disabled
    if (!showDotsDir) {
      result = result.filter(
        (entry) => entry.filename !== "." && entry.filename !== "..",
      );
    }

    return result;
  }
}
