/**
 * Escapes a value for use in PostgREST filter strings (like in .or() or .filter()).
 * Reserved characters in PostgREST are , . : ( ) " \
 * If a value contains these, it should be enclosed in double quotes.
 * Inside double quotes, " and \ must be escaped with a backslash.
 *
 * @param value The value to escape
 * @returns The escaped value, enclosed in double quotes
 */
export function escapeFilterValue(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}
