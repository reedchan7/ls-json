import { LsParser, LsRecursiveParser, LsStreamingParser } from "./parsers";
import {
  LsStreamEntry,
  ParseOptions,
  ParseResult,
} from "./types";

// Export all types - these are the public API
export * from "./types";

/**
 * Parse ls output - supports both standard and recursive modes
 * 
 * @param data - The ls command output string
 * @param options - Parse options
 * @param options.recursive - Set to true to parse recursive ls output (ls -R)
 * @param options.depth - Maximum depth for recursive parsing (only used with recursive: true)
 * @param options.showDotsDir - Include . and .. entries in results
 * @param options.raw - Return raw data without processing
 * @param options.ignoreExceptions - Continue parsing on errors
 * 
 * @returns Array of LsEntry objects for standard mode, LsRecursiveOutput for recursive mode
 * 
 * @example
 * ```typescript
 * // Standard ls parsing
 * const result = parse(lsOutput);
 * 
 * // Recursive ls parsing
 * const result = parse(lsRecursiveOutput, { recursive: true });
 * 
 * // Recursive with depth limit
 * const result = parse(lsRecursiveOutput, { recursive: true, depth: 2 });
 * ```
 */
export function parse<T extends ParseOptions>(
  data: string,
  options?: T,
): ParseResult<T> {
  const opts = options || ({} as T);

  if (opts.recursive) {
    return LsRecursiveParser.parse(data, opts) as ParseResult<T>;
  } else {
    return LsParser.parse(data, opts) as ParseResult<T>;
  }
}

/**
 * Parse ls output in streaming mode
 * 
 * @param lines - Iterable of ls output lines
 * @param options - Parse options (same as parse function, but recursive mode not supported)
 * @returns Generator that yields LsStreamEntry objects
 * 
 * @example
 * ```typescript
 * const lines = lsOutput.split('\n');
 * for (const entry of parseStreaming(lines)) {
 *   console.log(entry.filename);
 * }
 * ```
 */
export function parseStreaming(
  lines: Iterable<string>,
  options?: ParseOptions,
): Generator<LsStreamEntry, void, unknown> {
  return LsStreamingParser.parse(lines, options);
}
